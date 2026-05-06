import { db } from '@/lib/db';
import { lessonProgress, courseLessons, courseSections, enrollments, courseCertificates, cpdLog, courses } from '@bukz/db';
import { eq, and, sql } from 'drizzle-orm';

export async function markLessonComplete(userId: string, lessonId: string) {
  const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId)).limit(1);
  if (!lesson) throw new Error('Lesson not found');

  const [section] = await db.select().from(courseSections).where(eq(courseSections.id, lesson.sectionId)).limit(1);
  if (!section) throw new Error('Section not found');

  const [enrollment] = await db.select().from(enrollments)
    .where(and(eq(enrollments.courseId, section.courseId), eq(enrollments.userId, userId))).limit(1);
  if (!enrollment) throw new Error('Not enrolled in this course');

  await db.insert(lessonProgress)
    .values({ userId, lessonId, completed: true, completedAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { completed: true, completedAt: new Date() },
    });

  const percent = await recalculateProgress(enrollment.id, userId, section.courseId);

  if (percent === 100 && !enrollment.completedAt) {
    await handleCourseCompletion(userId, enrollment.id, section.courseId);
  }

  return { lessonId, completed: true, progressPercent: percent };
}

export async function getCourseProgress(userId: string, courseId: string) {
  const [enrollment] = await db.select().from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId))).limit(1);

  if (!enrollment) return { enrolled: false, progressPercent: 0, completedLessons: [] };

  const progress = await db.select({ lessonId: lessonProgress.lessonId, completed: lessonProgress.completed })
    .from(lessonProgress).where(eq(lessonProgress.userId, userId));

  return {
    enrolled: true,
    progressPercent: enrollment.progressPercent,
    completedAt: enrollment.completedAt,
    completedLessons: progress.filter((p) => p.completed).map((p) => p.lessonId),
  };
}

async function recalculateProgress(enrollmentId: string, userId: string, courseId: string) {
  const totalResult = await db.execute<{ count: string }>(
    sql`SELECT COUNT(*)::int as count FROM course_lessons cl JOIN course_sections cs ON cs.id = cl.section_id WHERE cs.course_id = ${courseId}`,
  );
  const completedResult = await db.execute<{ count: string }>(
    sql`SELECT COUNT(*)::int as count FROM lesson_progress lp JOIN course_lessons cl ON cl.id = lp.lesson_id JOIN course_sections cs ON cs.id = cl.section_id WHERE cs.course_id = ${courseId} AND lp.user_id = ${userId} AND lp.completed = true`,
  );

  const total = Number(Array.isArray(totalResult) ? (totalResult[0] as { count: string })?.count ?? 0 : 0);
  const completed = Number(Array.isArray(completedResult) ? (completedResult[0] as { count: string })?.count ?? 0 : 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  await db.update(enrollments).set({ progressPercent: percent }).where(eq(enrollments.id, enrollmentId));
  return percent;
}

async function handleCourseCompletion(userId: string, enrollmentId: string, courseId: string) {
  await db.update(enrollments).set({ completedAt: new Date(), progressPercent: 100 }).where(eq(enrollments.id, enrollmentId));

  const certificateRows = await db.insert(courseCertificates)
    .values({ userId, courseId, issuedAt: new Date() })
    .onConflictDoNothing({
      target: [courseCertificates.userId, courseCertificates.courseId],
    })
    .returning({ id: courseCertificates.id });

  if (certificateRows.length === 0) return;

  const [course] = await db.select({ cpdHours: courses.cpdHours, title: courses.title }).from(courses).where(eq(courses.id, courseId)).limit(1);
  if (course) {
    await db.insert(cpdLog).values({
      userId, courseId, hours: course.cpdHours,
      activityDescription: `Completed course: ${course.title}`, loggedAt: new Date(),
    });
  }
}
