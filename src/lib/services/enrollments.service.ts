import { db } from '@/lib/db';
import { email } from '@/lib/email';
import { capture } from '@/lib/analytics';
import { enrollments, courses, lessonProgress, courseLessons, courseSections, users } from '@bukz/db';
import { eq, and, sql } from 'drizzle-orm';

export async function enrolInCourse(userId: string, courseId: string, stripePaymentIntentId?: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) throw new Error('Course not found');
  if (course.status !== 'published') throw new Error('Course is not available for enrolment');

  const [existing] = await db.select({ id: enrollments.id }).from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId))).limit(1);
  if (existing) throw new Error('Already enrolled in this course');

  if (Number(course.priceGbp) > 0 && !stripePaymentIntentId) {
    throw new Error('Paid courses must be purchased via checkout');
  }

  const [enrollment] = await db.insert(enrollments).values({
    userId, courseId, stripePaymentIntentId: stripePaymentIntentId ?? null, progressPercent: 0,
  }).returning();

  await db.update(courses).set({ enrollmentsCount: sql`${courses.enrollmentsCount} + 1`, updatedAt: new Date() }).where(eq(courses.id, courseId));

  const [userRow] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  if (userRow) {
    email.sendCourseEnrolment(userRow.email, userRow.name, course.title, course.slug, String(course.cpdHours)).catch(() => undefined);
  }

  capture(userId, 'course_enrolled', { courseId, courseTitle: course.title });
  return enrollment!;
}

export async function findEnrollmentsByUser(userId: string) {
  return db
    .select({
      id: enrollments.id, courseId: enrollments.courseId, progressPercent: enrollments.progressPercent,
      completedAt: enrollments.completedAt, createdAt: enrollments.createdAt,
      courseTitle: courses.title, courseSlug: courses.slug, thumbnailUrl: courses.thumbnailUrl,
      cpdHours: courses.cpdHours, priceGbp: courses.priceGbp, level: courses.level, ratingAvg: courses.ratingAvg,
    })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, userId));
}

export async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
  const [row] = await db.select({ id: enrollments.id }).from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId))).limit(1);
  return !!row;
}

export async function findEnrollmentById(enrollmentId: string, userId: string) {
  const [enrollment] = await db.select().from(enrollments)
    .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId))).limit(1);
  if (!enrollment) throw new Error('Enrollment not found');

  const progress = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  const sections = await db.select().from(courseSections).where(eq(courseSections.courseId, enrollment.courseId));
  const lessons = await db.select().from(courseLessons)
    .where(sql`${courseLessons.sectionId} IN (SELECT id FROM course_sections WHERE course_id = ${enrollment.courseId})`);

  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
  const sectionsWithProgress = sections.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.sectionId === s.id).map((l) => ({
      ...l,
      completed: progressMap.get(l.id)?.completed ?? false,
      completedAt: progressMap.get(l.id)?.completedAt ?? null,
    })),
  }));

  return { ...enrollment, sections: sectionsWithProgress };
}
