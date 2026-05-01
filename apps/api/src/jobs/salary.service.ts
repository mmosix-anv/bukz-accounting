import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { jobListings } from '@bukz/db';
import { eq, and, isNotNull } from 'drizzle-orm';

@Injectable()
export class SalaryService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getBenchmark(params: { role?: string; location?: string; experienceLevel?: string }) {
    const results = await this.drizzle.db
      .select({ salaryMin: jobListings.salaryMin, salaryMax: jobListings.salaryMax })
      .from(jobListings)
      .where(
        and(
          eq(jobListings.status, 'active'),
          isNotNull(jobListings.salaryMin),
          isNotNull(jobListings.salaryMax),
          params.experienceLevel
            ? eq(jobListings.experienceLevel, params.experienceLevel as 'entry' | 'mid' | 'senior' | 'director' | 'cfo')
            : undefined,
        ),
      )
      .limit(200);

    if (results.length === 0) return null;

    const midpoints = results
      .map((r) => (Number(r.salaryMin ?? 0) + Number(r.salaryMax ?? 0)) / 2)
      .sort((a, b) => a - b);

    const p = (pct: number) => midpoints[Math.floor(midpoints.length * pct)] ?? 0;

    return {
      percentile25: p(0.25),
      median: p(0.5),
      percentile75: p(0.75),
      sampleSize: results.length,
    };
  }
}
