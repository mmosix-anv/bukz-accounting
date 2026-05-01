import { db } from '@/lib/db';
import { email } from '@/lib/email';
import { capture } from '@/lib/analytics';
import { jobApplications, candidates, jobListings, users } from '@bukz/db';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { incrementJobApplications } from './job-listings.service';

export async function applyToJob(userId: string, jobId: string, coverLetter?: string) {
  const [candidate] = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
  if (!candidate) throw new Error('Complete your candidate profile first');
  if (!candidate.cvUrl) throw new Error('Upload your CV before applying');

  const [existing] = await db
    .select({ id: jobApplications.id })
    .from(jobApplications)
    .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, candidate.id)))
    .limit(1);

  if (existing) throw new Error('You have already applied to this job');

  const [application] = await db
    .insert(jobApplications)
    .values({ jobId, candidateId: candidate.id, coverLetter, status: 'submitted' })
    .returning();

  await incrementJobApplications(jobId);
  capture(userId, 'job_application_submitted', { jobId, applicationId: application!.id });
  return application!;
}

export async function findApplicationsByCandidate(userId: string) {
  const [cand] = await db.select({ id: candidates.id }).from(candidates).where(eq(candidates.userId, userId)).limit(1);
  if (!cand) return [];

  return db
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
    })
    .from(jobApplications)
    .innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId))
    .where(eq(jobApplications.candidateId, cand.id))
    .orderBy(desc(jobApplications.createdAt));
}

export async function findApplicationsByEmployer(employerId: string, statusFilter?: string) {
  const listings = await db.select({ id: jobListings.id }).from(jobListings).where(eq(jobListings.employerId, employerId));
  if (!listings.length) return [];

  const listingIds = listings.map((l) => l.id);
  const results = await db
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
    .where(inArray(jobApplications.jobId, listingIds))
    .orderBy(desc(jobApplications.createdAt));

  return statusFilter ? results.filter((r) => r.status === statusFilter) : results;
}

export async function updateApplicationStatus(
  employerId: string,
  id: string,
  status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'offered',
) {
  const [existing] = await db
    .select({ id: jobApplications.id, candidateId: jobApplications.candidateId, jobId: jobApplications.jobId, employerId: jobListings.employerId })
    .from(jobApplications)
    .innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId))
    .where(eq(jobApplications.id, id))
    .limit(1);

  if (!existing) throw new Error('Application not found');
  if (existing.employerId !== employerId) throw new Error('You cannot update this application');

  const [application] = await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id)).returning();

  if (application && ['shortlisted', 'rejected', 'offered'].includes(status)) {
    const [cand] = await db.select({ userId: candidates.userId }).from(candidates).where(eq(candidates.id, application.candidateId)).limit(1);
    if (cand) {
      const [userRow] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, cand.userId)).limit(1);
      const [listing] = await db.select({ title: jobListings.title }).from(jobListings).where(eq(jobListings.id, application.jobId)).limit(1);
      if (userRow && listing) {
        email.sendApplicationStatusUpdate(userRow.email, userRow.name, listing.title, status).catch(() => undefined);
      }
    }
  }

  capture(employerId, 'job_application_status_updated', { applicationId: id, status });
  return application!;
}
