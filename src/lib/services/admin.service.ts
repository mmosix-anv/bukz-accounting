import { db } from '@/lib/db';
import { users, jobListings, enrollments, payments, articles, courses, experts } from '@bukz/db';
import { eq, desc, sql, and } from 'drizzle-orm';

export async function getAdminStats() {
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [listingCount] = await db.select({ count: sql<number>`count(*)` }).from(jobListings);
  const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
  const [articleCount] = await db.select({ count: sql<number>`count(*)` }).from(articles);
  const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
  const [expertCount] = await db.select({ count: sql<number>`count(*)` }).from(experts);

  const [revenueRow] = await db.select({ total: sql<number>`COALESCE(SUM(amount_pence), 0)` }).from(payments).where(eq(payments.status, 'completed'));
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [mtdRow] = await db.select({ total: sql<number>`COALESCE(SUM(amount_pence), 0)` }).from(payments)
    .where(and(eq(payments.status, 'completed'), sql`${payments.createdAt} >= ${startOfMonth}`));

  return {
    totalUsers: userCount?.count ?? 0,
    totalListings: listingCount?.count ?? 0,
    totalEnrollments: enrollmentCount?.count ?? 0,
    totalArticles: articleCount?.count ?? 0,
    totalCourses: courseCount?.count ?? 0,
    totalExperts: expertCount?.count ?? 0,
    totalRevenue: revenueRow?.total ?? 0,
    mtdRevenue: mtdRow?.total ?? 0,
  };
}

export async function getAdminUsers(role?: string, limit = 20, offset = 0) {
  const base = db.select({ id: users.id, email: users.email, name: users.name, role: users.role, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
    .from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  if (role) {
    return db.select({ id: users.id, email: users.email, name: users.name, role: users.role, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
      .from(users).where(eq(users.role, role as 'candidate' | 'employer' | 'instructor' | 'admin'))
      .orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  }
  return base;
}

export async function updateUserRole(userId: string, role: string) {
  const [updated] = await db.update(users).set({ role: role as 'candidate' | 'employer' | 'instructor' | 'admin' }).where(eq(users.id, userId)).returning();
  return updated;
}

export const getAdminPayments = (limit = 30, offset = 0) =>
  db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);

export async function getAdminArticles(status?: string, limit = 20, offset = 0) {
  if (status === 'draft' || status === 'published') {
    return db.select().from(articles).where(eq(articles.status, status)).orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
  }
  return db.select().from(articles).orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
}

export async function adminUpdateArticle(id: string, data: Partial<typeof articles.$inferInsert>) {
  const [article] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
  if (!article) throw new Error('Article not found');
  return article;
}

export async function adminDeleteArticle(id: string) {
  const [article] = await db.delete(articles).where(eq(articles.id, id)).returning();
  if (!article) throw new Error('Article not found');
  return { deleted: true };
}

export const getAdminExperts = (limit = 20, offset = 0) =>
  db.select().from(experts).orderBy(desc(experts.name)).limit(limit).offset(offset);

export async function adminUpdateExpert(id: string, data: Partial<typeof experts.$inferInsert>) {
  const [expert] = await db.update(experts).set(data).where(eq(experts.id, id)).returning();
  if (!expert) throw new Error('Expert not found');
  return expert;
}

export async function adminVerifyExpert(id: string) {
  const [expert] = await db.update(experts).set({ isVerified: true }).where(eq(experts.id, id)).returning();
  if (!expert) throw new Error('Expert not found');
  return expert;
}

export async function getAdminJobListings(status?: string, limit = 20, offset = 0) {
  const validStatuses = ['draft', 'active', 'expired', 'filled'] as const;
  const s = validStatuses.find((v) => v === status);
  if (s) return db.select().from(jobListings).where(eq(jobListings.status, s)).orderBy(desc(jobListings.createdAt)).limit(limit).offset(offset);
  return db.select().from(jobListings).orderBy(desc(jobListings.createdAt)).limit(limit).offset(offset);
}

export async function adminUpdateJobListing(id: string, data: Partial<typeof jobListings.$inferInsert>) {
  const [listing] = await db.update(jobListings).set(data).where(eq(jobListings.id, id)).returning();
  if (!listing) throw new Error('Job listing not found');
  return listing;
}

export async function adminDeleteJobListing(id: string) {
  const [listing] = await db.delete(jobListings).where(eq(jobListings.id, id)).returning();
  if (!listing) throw new Error('Job listing not found');
  return { deleted: true };
}
