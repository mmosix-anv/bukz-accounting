import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { jobApplications, candidates, jobListings } from '@bukz/db';
import { eq, and, desc } from 'drizzle-orm';
import { JobListingsService } from './job-listings.service';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly listingsService: JobListingsService,
  ) {}

  async apply(userId: string, jobId: string, coverLetter?: string) {
    const candidate = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);

    if (!candidate[0]) throw new BadRequestException('Complete your candidate profile first');
    if (!candidate[0].cvUrl) throw new BadRequestException('Upload your CV before applying');

    const existing = await this.drizzle.db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.candidateId, candidate[0].id),
        ),
      )
      .limit(1);

    if (existing[0]) throw new ConflictException('You have already applied to this job');

    const [application] = await this.drizzle.db
      .insert(jobApplications)
      .values({
        jobId,
        candidateId: candidate[0].id,
        coverLetter,
        status: 'submitted',
      })
      .returning();

    await this.listingsService.incrementApplications(jobId);
    return application!;
  }

  async findByCandidate(userId: string) {
    const candidateRow = await this.drizzle.db
      .select({ id: candidates.id })
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);

    if (!candidateRow[0]) return [];

    return this.drizzle.db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        coverLetter: jobApplications.coverLetter,
        createdAt: jobApplications.createdAt,
        jobTitle: jobListings.title,
        jobSlug: jobListings.slug,
        jobLocation: jobListings.location,
        salaryMin: jobListings.salaryMin,
        salaryMax: jobListings.salaryMax,
        salaryCurrency: jobListings.salaryCurrency,
      })
      .from(jobApplications)
      .innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId))
      .where(eq(jobApplications.candidateId, candidateRow[0].id))
      .orderBy(desc(jobApplications.createdAt));
  }

  async findByEmployer(employerId: string, statusFilter?: string) {
    const employerListings = await this.drizzle.db
      .select({ id: jobListings.id })
      .from(jobListings)
      .where(eq(jobListings.employerId, employerId));

    if (!employerListings.length) return [];

    const listingIds = employerListings.map((l) => l.id);

    const conditions = listingIds.map((id) => eq(jobApplications.jobId, id));
    const baseCondition = conditions.reduce(
      (acc, c) => (acc ? and(acc, c) : c),
      undefined as ReturnType<typeof eq> | undefined,
    );

    const query = this.drizzle.db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        coverLetter: jobApplications.coverLetter,
        createdAt: jobApplications.createdAt,
        jobTitle: jobListings.title,
        jobId: jobListings.id,
        candidateId: jobApplications.candidateId,
      })
      .from(jobApplications)
      .innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId))
      .where(baseCondition)
      .orderBy(desc(jobApplications.createdAt));

    const results = await query;

    if (statusFilter) {
      return results.filter((r) => r.status === statusFilter);
    }
    return results;
  }

  async updateStatus(
    id: string,
    status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'offered',
  ) {
    const [application] = await this.drizzle.db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return application!;
  }
}
