import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { users, jobListings, enrollments, payments, articles, courses, experts } from '@bukz/db';
import { eq, desc, sql, and } from 'drizzle-orm';

@Injectable()
export class AdminService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getStats() {
    const [userCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(users);
    const [listingCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(jobListings);
    const [enrollmentCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(enrollments);
    const [articleCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(articles);
    const [courseCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(courses);
    const [expertCount] = await this.drizzle.db.select({ count: sql<number>`count(*)` }).from(experts);

    const revenueResult = await this.drizzle.db
      .select({ total: sql<number>`COALESCE(SUM(amount_pence), 0)` })
      .from(payments)
      .where(eq(payments.status, 'completed'));
    const totalRevenue = revenueResult[0]?.total ?? 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mtdRevenueResult = await this.drizzle.db
      .select({ total: sql<number>`COALESCE(SUM(amount_pence), 0)` })
      .from(payments)
      .where(and(eq(payments.status, 'completed'), sql`${payments.createdAt} >= ${startOfMonth}`));
    const mtdRevenue = mtdRevenueResult[0]?.total ?? 0;

    return {
      totalUsers: userCount?.count ?? 0,
      totalListings: listingCount?.count ?? 0,
      totalEnrollments: enrollmentCount?.count ?? 0,
      totalArticles: articleCount?.count ?? 0,
      totalCourses: courseCount?.count ?? 0,
      totalExperts: expertCount?.count ?? 0,
      totalRevenue,
      mtdRevenue,
    };
  }

  async getUsers(role?: string, limit = 20, offset = 0) {
    if (role) {
      return this.drizzle.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, role as 'candidate' | 'employer' | 'instructor' | 'admin'))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return this.drizzle.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateUserRole(userId: string, role: string) {
    const [updated] = await this.drizzle.db
      .update(users)
      .set({ role: role as 'candidate' | 'employer' | 'instructor' | 'admin' })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getPayments(limit = 30, offset = 0) {
    return this.drizzle.db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
