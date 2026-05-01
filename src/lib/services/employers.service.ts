import { db } from '@/lib/db';
import { jobListings, profiles } from '@bukz/db';
import { eq } from 'drizzle-orm';

export async function getEmployerProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function updateEmployerProfile(userId: string, data: Partial<{ bio: string; location: string; phone: string; linkedinUrl: string; websiteUrl: string }>) {
  const [updated] = await db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning();
  return updated!;
}

export async function getEmployerListings(employerId: string) {
  return db
    .select({
      id: jobListings.id, title: jobListings.title, slug: jobListings.slug, status: jobListings.status,
      applicationsCount: jobListings.applicationsCount, viewsCount: jobListings.viewsCount,
      featured: jobListings.featured, expiresAt: jobListings.expiresAt, createdAt: jobListings.createdAt,
      jobType: jobListings.jobType, location: jobListings.location,
      salaryMin: jobListings.salaryMin, salaryMax: jobListings.salaryMax, salaryCurrency: jobListings.salaryCurrency,
    })
    .from(jobListings)
    .where(eq(jobListings.employerId, employerId));
}

export async function getEmployerStats(employerId: string) {
  const listings = await getEmployerListings(employerId);
  return {
    activeListings: listings.filter((l) => l.status === 'active').length,
    totalApplications: listings.reduce((s, l) => s + (l.applicationsCount ?? 0), 0),
    totalViews: listings.reduce((s, l) => s + (l.viewsCount ?? 0), 0),
    totalListings: listings.length,
  };
}
