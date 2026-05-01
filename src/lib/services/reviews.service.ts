import { db } from '@/lib/db';
import { courseReviews, enrollments, courses, users } from '@bukz/db';
import { eq, and, desc, avg, sql } from 'drizzle-orm';

export async function createReview(userId: string, courseId: string, rating: number, body?: string) {
  const [enrollment] = await db.select({ id: enrollments.id, completedAt: enrollments.completedAt }).from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId))).limit(1);

  if (!enrollment) throw new Error('You must be enrolled to leave a review');
  if (!enrollment.completedAt) throw new Error('Complete the course before reviewing');

  const [existing] = await db.select({ id: courseReviews.id }).from(courseReviews)
    .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.userId, userId))).limit(1);
  if (existing) throw new Error('You have already reviewed this course');

  const [review] = await db.insert(courseReviews).values({ userId, courseId, rating, body }).returning();
  await recalculateRating(courseId);
  return review!;
}

export async function findReviewsByCourse(courseId: string, limit = 20, offset = 0) {
  return db
    .select({
      id: courseReviews.id, rating: courseReviews.rating, body: courseReviews.body, createdAt: courseReviews.createdAt,
      reviewerName: users.name, reviewerAvatar: users.avatarUrl,
    })
    .from(courseReviews)
    .innerJoin(users, eq(users.id, courseReviews.userId))
    .where(eq(courseReviews.courseId, courseId))
    .orderBy(desc(courseReviews.createdAt))
    .limit(limit)
    .offset(offset);
}

async function recalculateRating(courseId: string) {
  const [result] = await db
    .select({ ratingAvg: avg(courseReviews.rating), ratingCount: sql<number>`COUNT(*)` })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId));

  if (!result) return;
  await db.update(courses).set({
    ratingAvg: result.ratingAvg ? String(parseFloat(result.ratingAvg).toFixed(2)) : null,
    ratingCount: Number(result.ratingCount),
    updatedAt: new Date(),
  }).where(eq(courses.id, courseId));
}
