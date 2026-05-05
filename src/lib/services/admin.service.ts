import { db } from '@/lib/db';
import { users, profiles, jobListings, jobApplications, enrollments, payments, articles, courses, experts } from '@bukz/db';
import { eq, desc, sql, and } from 'drizzle-orm';

export async function getAdminStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const rows = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM users) AS user_count,
      (SELECT count(*) FROM job_listings) AS listing_count,
      (SELECT count(*) FROM enrollments) AS enrollment_count,
      (SELECT count(*) FROM articles) AS article_count,
      (SELECT count(*) FROM courses) AS course_count,
      (SELECT count(*) FROM experts) AS expert_count,
      (SELECT COALESCE(SUM(amount_pence), 0) FROM payments WHERE status = 'completed') AS total_revenue,
      (SELECT COALESCE(SUM(amount_pence), 0) FROM payments WHERE status = 'completed' AND created_at >= ${startOfMonth}) AS mtd_revenue
  `);
  const row = rows[0] as Record<string, unknown> | undefined;

  return {
    totalUsers: Number(row?.user_count ?? 0),
    totalListings: Number(row?.listing_count ?? 0),
    totalEnrollments: Number(row?.enrollment_count ?? 0),
    totalArticles: Number(row?.article_count ?? 0),
    totalCourses: Number(row?.course_count ?? 0),
    totalExperts: Number(row?.expert_count ?? 0),
    totalRevenue: Number(row?.total_revenue ?? 0),
    mtdRevenue: Number(row?.mtd_revenue ?? 0),
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

export async function getAdminUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  const userEnrollments = await db
    .select({ id: enrollments.id, courseTitle: courses.title, progressPercent: enrollments.progressPercent, completedAt: enrollments.completedAt, createdAt: enrollments.createdAt })
    .from(enrollments).innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.createdAt)).limit(10);

  const userApplications = await db
    .select({ id: jobApplications.id, status: jobApplications.status, createdAt: jobApplications.createdAt, jobTitle: jobListings.title })
    .from(jobApplications).innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId))
    .where(sql`${jobApplications.candidateId} IN (SELECT id FROM candidates WHERE user_id = ${userId})`)
    .orderBy(desc(jobApplications.createdAt)).limit(10);

  const userPayments = await db
    .select({ id: payments.id, amountPence: payments.amountPence, currency: payments.currency, status: payments.status, description: payments.description, createdAt: payments.createdAt })
    .from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(10);

  return { ...user, profile: profile ?? null, enrollments: userEnrollments, applications: userApplications, payments: userPayments };
}

export async function getAdminUsersCount(role?: string) {
  if (role) {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, role as 'candidate' | 'employer' | 'instructor' | 'admin'));
    return row?.count ?? 0;
  }
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(users);
  return row?.count ?? 0;
}

export async function getAdminJobListingsCount(status?: string) {
  const validStatuses = ['draft', 'active', 'expired', 'filled'] as const;
  const s = validStatuses.find((v) => v === status);
  if (s) {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(jobListings).where(eq(jobListings.status, s));
    return row?.count ?? 0;
  }
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(jobListings);
  return row?.count ?? 0;
}

export async function getAdminArticlesCount(status?: string) {
  if (status === 'draft' || status === 'published') {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, status));
    return row?.count ?? 0;
  }
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(articles);
  return row?.count ?? 0;
}

export async function getAdminPaymentsCount() {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(payments);
  return row?.count ?? 0;
}

export async function getAdminPaymentsWithUsers(limit = 30, offset = 0) {
  return db
    .select({
      id: payments.id, amountPence: payments.amountPence, currency: payments.currency,
      status: payments.status, description: payments.description, createdAt: payments.createdAt,
      userId: payments.userId, userName: users.name, userEmail: users.email,
    })
    .from(payments)
    .leftJoin(users, eq(users.id, payments.userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit).offset(offset);
}

export async function getAdminCoursesCount(status?: string) {
  const validStatuses = ['draft', 'published', 'archived'] as const;
  const s = validStatuses.find((v) => v === status);
  if (s) {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.status, s));
    return row?.count ?? 0;
  }
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(courses);
  return row?.count ?? 0;
}

export async function adminCreateJobListing(data: {
  title: string; description: string; location: string; employerId: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'interim' | 'graduate';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'director' | 'cfo';
  remotePolicy: 'office' | 'hybrid' | 'remote';
  salaryMin?: string | null; salaryMax?: string | null; salaryCurrency?: string;
  status?: 'draft' | 'active' | 'expired' | 'filled';
  featured?: boolean; expiresAt?: string | null; categoryId?: string | null;
}) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + Date.now();
  const [listing] = await db.insert(jobListings).values({
    ...data,
    slug,
    salaryCurrency: data.salaryCurrency ?? 'GBP',
    status: data.status ?? 'draft',
    featured: data.featured ?? false,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  }).returning();
  return listing!;
}

export async function getAdminJobListingById(id: string) {
  const [listing] = await db.select().from(jobListings).where(eq(jobListings.id, id)).limit(1);
  if (!listing) throw new Error('Job listing not found');
  return listing;
}
