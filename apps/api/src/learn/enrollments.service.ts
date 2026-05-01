import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { enrollments, courses, lessonProgress, courseLessons, courseSections } from '@bukz/db';
import { eq, and, sql } from 'drizzle-orm';
import Stripe from 'stripe';

@Injectable()
export class EnrollmentsService {
  private readonly stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '');

  constructor(private readonly drizzle: DrizzleService) {}

  async enrol(userId: string, courseId: string, stripePaymentIntentId?: string) {
    const [course] = await this.drizzle.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'published') throw new BadRequestException('Course is not available for enrolment');

    const existing = await this.drizzle.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId)))
      .limit(1);

    if (existing[0]) throw new ConflictException('Already enrolled in this course');

    const isPaid = Number(course.priceGbp) > 0;

    if (isPaid) {
      if (!stripePaymentIntentId) {
        throw new BadRequestException('Payment intent ID required for paid courses');
      }
      const intent = await this.stripe.paymentIntents.retrieve(stripePaymentIntentId);
      if (intent.status !== 'succeeded') {
        throw new BadRequestException(`Payment not successful: ${intent.status}`);
      }
    }

    const [enrollment] = await this.drizzle.db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        progressPercent: 0,
      })
      .returning();

    await this.drizzle.db
      .update(courses)
      .set({ enrollmentsCount: sql`${courses.enrollmentsCount} + 1`, updatedAt: new Date() })
      .where(eq(courses.id, courseId));

    return enrollment!;
  }

  async findByUser(userId: string) {
    const rows = await this.drizzle.db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        progressPercent: enrollments.progressPercent,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        thumbnailUrl: courses.thumbnailUrl,
        cpdHours: courses.cpdHours,
        priceGbp: courses.priceGbp,
        level: courses.level,
        ratingAvg: courses.ratingAvg,
      })
      .from(enrollments)
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId));

    return rows;
  }

  async findById(enrollmentId: string, userId: string) {
    const [enrollment] = await this.drizzle.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId)))
      .limit(1);

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const progress = await this.drizzle.db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));

    const sections = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.courseId, enrollment.courseId));

    const lessons = await this.drizzle.db
      .select()
      .from(courseLessons)
      .where(
        sql`${courseLessons.sectionId} IN (SELECT id FROM course_sections WHERE course_id = ${enrollment.courseId})`,
      );

    const lessonProgressMap = new Map(progress.map((p) => [p.lessonId, p]));

    const sectionsWithProgress = sections.map((s) => ({
      ...s,
      lessons: lessons
        .filter((l) => l.sectionId === s.id)
        .map((l) => ({
          ...l,
          completed: lessonProgressMap.get(l.id)?.completed ?? false,
          completedAt: lessonProgressMap.get(l.id)?.completedAt ?? null,
        })),
    }));

    return { ...enrollment, sections: sectionsWithProgress };
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId)))
      .limit(1);
    return !!row;
  }

  async recalculateProgress(enrollmentId: string, userId: string): Promise<number> {
    const [enrollment] = await this.drizzle.db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) return 0;

    const totalLessons = await this.drizzle.db.execute<{ count: string }>(
      sql`SELECT COUNT(*) as count FROM course_lessons cl
          JOIN course_sections cs ON cs.id = cl.section_id
          WHERE cs.course_id = ${enrollment.courseId}`,
    );

    const completedLessons = await this.drizzle.db.execute<{ count: string }>(
      sql`SELECT COUNT(*) as count FROM lesson_progress lp
          JOIN course_lessons cl ON cl.id = lp.lesson_id
          JOIN course_sections cs ON cs.id = cl.section_id
          WHERE cs.course_id = ${enrollment.courseId}
            AND lp.user_id = ${userId}
            AND lp.completed = true`,
    );

    const total = Number(Array.isArray(totalLessons) ? (totalLessons[0] as { count: string })?.count : 0);
    const completed = Number(Array.isArray(completedLessons) ? (completedLessons[0] as { count: string })?.count : 0);

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    await this.drizzle.db
      .update(enrollments)
      .set({
        progressPercent: percent,
        completedAt: percent === 100 ? new Date() : null,
      })
      .where(eq(enrollments.id, enrollmentId));

    return percent;
  }
}
