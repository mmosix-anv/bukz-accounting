import { db } from '@/lib/db';
import { jobListings, employerSubscriptions } from '@bukz/db';
import { eq, and, gte, lte, desc, inArray, sql } from 'drizzle-orm';

export interface JobListingsFilter {
  jobType?: string[];
  experienceLevel?: string[];
  remotePolicy?: string[];
  salaryMin?: number;
  salaryMax?: number;
  status?: 'active' | 'draft' | 'expired' | 'filled';
  limit?: number;
  offset?: number;
}

export async function findAllJobListings(filter: JobListingsFilter = {}) {
  const { jobType, experienceLevel, remotePolicy, salaryMin, salaryMax, limit = 20, offset = 0 } = filter;
  const conditions: ReturnType<typeof eq>[] = [eq(jobListings.status, filter.status ?? 'active')];

  if (jobType?.length) conditions.push(inArray(jobListings.jobType, jobType as ('full_time' | 'part_time' | 'contract' | 'interim' | 'graduate')[]));
  if (experienceLevel?.length) conditions.push(inArray(jobListings.experienceLevel, experienceLevel as ('entry' | 'mid' | 'senior' | 'director' | 'cfo')[]));
  if (remotePolicy?.length) conditions.push(inArray(jobListings.remotePolicy, remotePolicy as ('office' | 'hybrid' | 'remote')[]));
  if (salaryMin !== undefined) conditions.push(gte(jobListings.salaryMin, String(salaryMin)));
  if (salaryMax !== undefined) conditions.push(lte(jobListings.salaryMax, String(salaryMax)));

  return db
    .select()
    .from(jobListings)
    .where(and(...conditions))
    .orderBy(desc(jobListings.featured), desc(jobListings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findJobListingBySlug(slug: string) {
  const [listing] = await db.select().from(jobListings).where(eq(jobListings.slug, slug)).limit(1);
  if (!listing) throw new Error(`Job listing not found: ${slug}`);
  return listing;
}

export async function findJobListingById(id: string) {
  const [listing] = await db.select().from(jobListings).where(eq(jobListings.id, id)).limit(1);
  if (!listing) throw new Error(`Job listing not found: ${id}`);
  return listing;
}

export async function createJobListing(data: typeof jobListings.$inferInsert) {
  await assertEmployerCanCreateListing(data.employerId);
  const slug = slugify(data.title ?? '') + '-' + Date.now();
  const [listing] = await db.insert(jobListings).values({ ...data, slug }).returning();
  return listing!;
}

export async function updateJobListing(id: string, employerId: string, data: Partial<typeof jobListings.$inferInsert>, isAdmin = false) {
  const existing = await findJobListingById(id);
  if (!isAdmin && existing.employerId !== employerId) throw new Error('You do not own this listing');
  const [updated] = await db.update(jobListings).set({ ...data, updatedAt: new Date() }).where(eq(jobListings.id, id)).returning();
  return updated!;
}

export const softDeleteJobListing = (id: string, employerId: string, isAdmin = false) =>
  updateJobListing(id, employerId, { status: 'expired' }, isAdmin);

export async function markJobListingFeatured(id: string, featured: boolean) {
  const [updated] = await db.update(jobListings).set({ featured, updatedAt: new Date() }).where(eq(jobListings.id, id)).returning();
  return updated!;
}

export async function incrementJobViews(id: string) {
  await db.update(jobListings).set({ viewsCount: sql`${jobListings.viewsCount} + 1` }).where(eq(jobListings.id, id));
}

export async function incrementJobApplications(id: string) {
  await db.update(jobListings).set({ applicationsCount: sql`${jobListings.applicationsCount} + 1` }).where(eq(jobListings.id, id));
}

export async function findJobListingsByEmployer(employerId: string) {
  return db.select().from(jobListings).where(eq(jobListings.employerId, employerId)).orderBy(desc(jobListings.createdAt));
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

async function assertEmployerCanCreateListing(employerId: string) {
  const [sub] = await db.select().from(employerSubscriptions).where(eq(employerSubscriptions.userId, employerId)).limit(1);
  if (sub?.status && sub.status !== 'active') throw new Error('Active subscription required');

  const limit = sub?.activeListingsLimit ?? 1;
  const activeResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobListings)
    .where(and(eq(jobListings.employerId, employerId), eq(jobListings.status, 'active')));

  if ((activeResult[0]?.count ?? 0) >= limit) throw new Error('Active job listing limit reached for subscription tier');
}
