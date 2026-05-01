import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { candidates, jobListings, courses, enrollments } from '@bukz/db';
import { eq, desc, and, sql } from 'drizzle-orm';

const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.slice(0, 8000) });
  return response.data[0]?.embedding ?? [];
}

export async function generateCandidateEmbedding(candidateId: string) {
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, candidateId)).limit(1);
  if (!candidate) return null;

  const text = [candidate.headline ?? '', (candidate.qualifications ?? []).join(' '), (candidate.softwareSkills ?? []).join(' ')].filter(Boolean).join('. ');
  if (!text.trim()) return null;

  const embedding = await generateEmbedding(text);
  await db.execute(sql`UPDATE candidates SET embedding = ${`[${embedding.join(',')}]`}::vector WHERE id = ${candidateId}`);
  return embedding;
}

export async function analyseSkillsGap(userId: string) {
  const [candidate] = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
  if (!candidate) return null;

  const profile = {
    qualifications: candidate.qualifications ?? [],
    softwareSkills: candidate.softwareSkills ?? [],
    headline: candidate.headline,
  };

  const [activeJobs, availableCourses] = await Promise.all([
    db.select({ qualifications: jobListings.qualifications, softwareSkills: jobListings.softwareSkills, salaryMin: jobListings.salaryMin })
      .from(jobListings).where(eq(jobListings.status, 'active')).orderBy(desc(jobListings.createdAt)).limit(50),
    db.select().from(courses).where(eq(courses.status, 'published')),
  ]);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: 'You are a career advisor for UK accounting professionals. Return valid JSON only.',
    messages: [{
      role: 'user',
      content: `Based on this candidate profile: ${JSON.stringify(profile)}
And these top job market requirements: ${JSON.stringify(activeJobs)}
Identify: 1) Skills the candidate has that are in demand 2) Skills gaps — what they're missing vs market demand
3) Recommended courses from this list: ${JSON.stringify(availableCourses)}
4) Estimated salary uplift in GBP from closing each gap
Return as JSON: { strengths: string[], gaps: string[], recommendations: string[], salary_impact: number }`,
    }],
  });

  const content = message.content[0];
  if (content?.type !== 'text') return null;

  try { return JSON.parse(content.text) as unknown; } catch { return null; }
}

export async function getJobRecommendations(userId: string, limit = 6) {
  const [candidate] = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);

  if (candidate?.embedding) {
    const results = await db.execute<{ id: string; title: string; slug: string; location: string }>(
      sql`SELECT id, title, slug, location FROM job_listings WHERE status = 'active' ORDER BY embedding <=> ${candidate.embedding}::vector LIMIT ${limit}`,
    );
    return Array.isArray(results) ? results : [];
  }

  return db.select({ id: jobListings.id, title: jobListings.title, slug: jobListings.slug, location: jobListings.location })
    .from(jobListings).where(eq(jobListings.status, 'active')).orderBy(desc(jobListings.createdAt)).limit(limit);
}

export async function getCourseRecommendations(userId: string, limit = 6) {
  const userEnrollments = await db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, userId));
  const enrolledIds = userEnrollments.map((e) => e.courseId);

  return db.select().from(courses)
    .where(and(
      eq(courses.status, 'published'),
      enrolledIds.length ? sql`id NOT IN (${sql.join(enrolledIds.map((id) => sql`${id}`), sql`, `)})` : undefined,
    ))
    .orderBy(desc(courses.enrollmentsCount))
    .limit(limit);
}
