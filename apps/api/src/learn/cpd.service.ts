import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { cpdLog, courses } from '@bukz/db';
import { eq, desc, sql } from 'drizzle-orm';

const CPD_REQUIREMENTS: Record<string, number> = {
  ICAEW: 40,
  ACCA: 40,
  CIMA: 20,
  AAT: 30,
  CIPFA: 30,
};

@Injectable()
export class CpdService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getMyCpdLog(userId: string) {
    const log = await this.drizzle.db
      .select({
        id: cpdLog.id,
        hours: cpdLog.hours,
        activityDescription: cpdLog.activityDescription,
        loggedAt: cpdLog.loggedAt,
        courseTitle: courses.title,
        courseSlug: courses.slug,
      })
      .from(cpdLog)
      .leftJoin(courses, eq(courses.id, cpdLog.courseId))
      .where(eq(cpdLog.userId, userId))
      .orderBy(desc(cpdLog.loggedAt));

    const byYear: Record<number, { hours: number; entries: typeof log }> = {};
    for (const entry of log) {
      const year = new Date(entry.loggedAt).getFullYear();
      if (!byYear[year]) byYear[year] = { hours: 0, entries: [] };
      byYear[year].hours += Number(entry.hours);
      byYear[year].entries.push(entry);
    }

    return { log, byYear };
  }

  async logManual(userId: string, data: { hours: number; activityDescription: string; loggedAt?: Date }) {
    const [entry] = await this.drizzle.db
      .insert(cpdLog)
      .values({
        userId,
        hours: String(data.hours),
        activityDescription: data.activityDescription,
        loggedAt: data.loggedAt ?? new Date(),
      })
      .returning();
    return entry!;
  }

  async getSummary(userId: string) {
    const thisYear = new Date().getFullYear();

    const result = await this.drizzle.db.execute<{ total: string }>(
      sql`SELECT COALESCE(SUM(hours), 0) as total
          FROM cpd_log
          WHERE user_id = ${userId}
            AND EXTRACT(YEAR FROM logged_at) = ${thisYear}`,
    );

    const totalHours = Number(
      Array.isArray(result) ? (result[0] as { total: string })?.total ?? 0 : 0,
    );

    const byMonth = await this.drizzle.db.execute<{ month: string; hours: string }>(
      sql`SELECT
            TO_CHAR(logged_at, 'Mon') as month,
            EXTRACT(MONTH FROM logged_at) as month_num,
            SUM(hours) as hours
          FROM cpd_log
          WHERE user_id = ${userId}
            AND EXTRACT(YEAR FROM logged_at) = ${thisYear}
          GROUP BY TO_CHAR(logged_at, 'Mon'), EXTRACT(MONTH FROM logged_at)
          ORDER BY month_num`,
    );

    const monthlyData = Array.isArray(byMonth)
      ? (byMonth as { month: string; hours: string }[]).map((r) => ({
          month: r.month,
          hours: Number(r.hours),
        }))
      : [];

    const requirements = Object.entries(CPD_REQUIREMENTS).map(([body, required]) => ({
      body,
      required,
      completed: totalHours,
      remaining: Math.max(0, required - totalHours),
      percentage: Math.min(100, Math.round((totalHours / required) * 100)),
      met: totalHours >= required,
    }));

    return {
      year: thisYear,
      totalHours,
      monthlyData,
      requirements,
    };
  }
}
