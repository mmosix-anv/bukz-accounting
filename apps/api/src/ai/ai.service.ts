import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { LoggerService } from '../common/services/logger.service';
import { DrizzleService } from '../common/services/drizzle.service';
import { candidates, jobListings, courses, enrollments } from '@bukz/db';
import { eq, sql, desc, and } from 'drizzle-orm';

@Injectable()
export class AiService {
  private readonly openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
  private readonly anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

  constructor(
    private readonly logger: LoggerService,
    private readonly drizzle: DrizzleService,
  ) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return response.data[0]?.embedding ?? [];
  }

  async generateCandidateEmbedding(candidateId: string) {
    const [candidate] = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1);

    if (!candidate) return null;

    const text = [
      candidate.headline ?? '',
      (candidate.qualifications ?? []).join(' '),
      (candidate.softwareSkills ?? []).join(' '),
    ]
      .filter(Boolean)
      .join('. ');

    if (!text.trim()) return null;

    const embedding = await this.generateEmbedding(text);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await this.drizzle.db.execute(
      sql`UPDATE candidates SET embedding = ${vectorLiteral}::vector WHERE id = ${candidateId}`,
    );

    this.logger.log(`Generated embedding for candidate ${candidateId}`, AiService.name);
    return embedding;
  }

  async matchJobsForCandidate(candidateId: string, limit = 10) {
    const [candidate] = await this.drizzle.db
      .select({ id: candidates.id })
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1);

    if (!candidate) return [];

    const results = await this.drizzle.db.execute<{
      id: string;
      title: string;
      slug: string;
      location: string;
      salary_min: string;
      salary_max: string;
      salary_currency: string;
      job_type: string;
      remote_policy: string;
    }>(sql`
      SELECT
        jl.id, jl.title, jl.slug, jl.location,
        jl.salary_min, jl.salary_max, jl.salary_currency,
        jl.job_type, jl.remote_policy
      FROM job_listings jl, candidates c
      WHERE c.id = ${candidateId}
        AND c.embedding IS NOT NULL
        AND jl.status = 'active'
      ORDER BY jl.embedding <=> c.embedding
      LIMIT ${limit}
    `);

    return Array.isArray(results) ? results : [];
  }

  async analyseSkillsGap(userId: string) {
    this.logger.log(`Running skills gap analysis for user ${userId}`, AiService.name);

    const [candidate] = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);

    if (!candidate) return null;

    const profile = {
      qualifications: candidate.qualifications ?? [],
      softwareSkills: candidate.softwareSkills ?? [],
      headline: candidate.headline,
    };

    const activeJobs = await this.drizzle.db
      .select({
        qualifications: jobListings.qualifications,
        softwareSkills: jobListings.softwareSkills,
        salaryMin: jobListings.salaryMin,
      })
      .from(jobListings)
      .where(eq(jobListings.status, 'active'))
      .orderBy(desc(jobListings.createdAt))
      .limit(50);

    const availableCourses = await this.drizzle.db
      .select()
      .from(courses)
      .where(eq(courses.status, 'published'));

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'You are a career advisor for UK accounting professionals. Return valid JSON only.',
      messages: [
        {
          role: 'user',
          content: `Based on this candidate profile: ${JSON.stringify(profile)}
And these top job market requirements: ${JSON.stringify(activeJobs)}
Identify: 1) Skills the candidate has that are in demand
2) Skills gaps — what they're missing vs market demand
3) Recommended courses from this list: ${JSON.stringify(availableCourses)}
4) Estimated salary uplift in GBP from closing each gap
Return as JSON: { strengths: string[], gaps: string[], recommendations: string[], salary_impact: number }`,
        },
      ],
    });

    const content = message.content[0];
    if (content?.type !== 'text') return null;

    try {
      return JSON.parse(content.text) as unknown;
    } catch {
      this.logger.error('Failed to parse AI response', undefined, AiService.name);
      return null;
    }
  }

  async getJobRecommendations(userId: string, limit = 6) {
    const [candidate] = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);

    if (candidate && candidate.embedding) {
      const results = await this.drizzle.db.execute<{
        id: string; title: string; slug: string; location: string }>(
        sql`
          SELECT id, title, slug, location
          FROM job_listings
          WHERE status = 'active'
          ORDER BY embedding <=> ${candidate.embedding}::vector
          LIMIT ${limit}
        `,
      );
      return Array.isArray(results) ? results : [];
    }

    return this.drizzle.db
      .select({ id: jobListings.id, title: jobListings.title, slug: jobListings.slug, location: jobListings.location })
      .from(jobListings)
      .where(eq(jobListings.status, 'active'))
      .orderBy(desc(jobListings.createdAt))
      .limit(limit);
  }

  async getCourseRecommendations(userId: string, limit = 6) {
    const userEnrollments = await this.drizzle.db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const enrolledIds = userEnrollments.map((e) => e.courseId);

    return this.drizzle.db
      .select()
      .from(courses)
      .where(and(eq(courses.status, 'published'), !enrolledIds.length ? undefined : sql`id NOT IN (${enrolledIds})`))
      .orderBy(desc(courses.enrollmentsCount))
      .limit(limit);
  }

  async getArticleRecommendations(userId: string, limit = 4) {
    return this.drizzle.db
      .select()
      .from(sql`articles`)
      .where(eq(sql`articles.status`, 'published'))
      .orderBy(desc(sql`articles.publishedAt`))
      .limit(limit);
  }
}
