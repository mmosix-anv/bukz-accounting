import { db } from '@/lib/db';
import { savedJobs, jobListings } from '@bukz/db';
import { eq, and, desc } from 'drizzle-orm';

export async function saveJob(userId: string, jobId: string) {
  const [existing] = await db.select().from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId))).limit(1);
  if (existing) return existing;

  await db.insert(savedJobs).values({ userId, jobId });
  return { userId, jobId, saved: true };
}

export async function unsaveJob(userId: string, jobId: string) {
  await db.delete(savedJobs).where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  return { userId, jobId, saved: false };
}

export async function getSavedJobs(userId: string) {
  return db
    .select({
      jobId: savedJobs.jobId,
      savedAt: savedJobs.createdAt,
      title: jobListings.title,
      slug: jobListings.slug,
      location: jobListings.location,
      salaryMin: jobListings.salaryMin,
      salaryMax: jobListings.salaryMax,
      salaryCurrency: jobListings.salaryCurrency,
      jobType: jobListings.jobType,
      remotePolicy: jobListings.remotePolicy,
      status: jobListings.status,
    })
    .from(savedJobs)
    .innerJoin(jobListings, eq(jobListings.id, savedJobs.jobId))
    .where(eq(savedJobs.userId, userId))
    .orderBy(desc(savedJobs.createdAt));
}

export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
  const [row] = await db.select({ jobId: savedJobs.jobId }).from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId))).limit(1);
  return !!row;
}
