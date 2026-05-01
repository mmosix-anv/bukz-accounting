import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { candidates, jobListings } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

interface SkillGap {
  skill: string;
  currentLevel: string;
  marketDemand: string;
  gapSeverity: 'low' | 'medium' | 'high';
  recommendedCourses: { title: string; slug: string }[];
}

interface SkillsGapResult {
  summary: string;
  gaps: SkillGap[];
  topRecommendation: string;
}

@Injectable()
export class SkillsGapService {
  private readonly anthropic: Anthropic | null;

  constructor(private readonly drizzle: DrizzleService) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    this.anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async analyse(userId: string): Promise<SkillsGapResult> {
    const [candidate] = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);

    const recentListings = await this.drizzle.db
      .select({ title: jobListings.title, description: jobListings.description })
      .from(jobListings)
      .where(eq(jobListings.status, 'active'))
      .orderBy(desc(jobListings.createdAt))
      .limit(20);

    if (!this.anthropic) {
      return this.fallbackResult(candidate);
    }

    const candidateContext = candidate
      ? `Headline: ${candidate.headline ?? 'Not specified'}\nQualifications: ${(candidate.qualifications ?? []).join(', ') || 'Not specified'}\nSoftware skills: ${(candidate.softwareSkills ?? []).join(', ') || 'Not specified'}\nYears experience: ${candidate.yearsExperience ?? 'Not specified'}`
      : 'No candidate profile available.';

    const marketContext = recentListings
      .slice(0, 10)
      .map((l) => `${l.title}: ${l.description?.slice(0, 200) ?? ''}`)
      .join('\n---\n');

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a UK accounting career advisor. Analyse the skills gap for this candidate based on current market demand.

CANDIDATE PROFILE:
${candidateContext}

RECENT UK ACCOUNTING JOB MARKET (sample listings):
${marketContext}

Return a JSON object with this exact structure (no markdown, raw JSON only):
{
  "summary": "2-3 sentence personalised summary",
  "gaps": [
    {
      "skill": "skill name",
      "currentLevel": "beginner|intermediate|advanced|not listed",
      "marketDemand": "high|medium|low",
      "gapSeverity": "high|medium|low",
      "recommendedCourses": []
    }
  ],
  "topRecommendation": "single actionable recommendation"
}

Identify 3-5 key skills gaps. Focus on UK accounting market: MTD, HMRC, Making Tax Digital, cloud accounting software, etc.`,
        },
      ],
    });

    const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
    try {
      return JSON.parse(text) as SkillsGapResult;
    } catch {
      return this.fallbackResult(candidate);
    }
  }

  private fallbackResult(candidate: typeof candidates.$inferSelect | undefined): SkillsGapResult {
    return {
      summary: candidate
        ? `Based on your profile as ${candidate.headline ?? 'an accounting professional'}, here are common skills gaps we see in the UK market.`
        : 'Complete your candidate profile to get a personalised skills gap analysis.',
      gaps: [
        { skill: 'Making Tax Digital (MTD)', currentLevel: 'not listed', marketDemand: 'high', gapSeverity: 'high', recommendedCourses: [] },
        { skill: 'Cloud Accounting Software', currentLevel: 'not listed', marketDemand: 'high', gapSeverity: 'medium', recommendedCourses: [] },
        { skill: 'Data Analytics', currentLevel: 'not listed', marketDemand: 'high', gapSeverity: 'medium', recommendedCourses: [] },
      ],
      topRecommendation: 'Complete your candidate profile with your current skills to receive a personalised analysis.',
    };
  }
}
