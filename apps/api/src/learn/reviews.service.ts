import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { courseReviews, enrollments, courses, users } from '@bukz/db';
import { eq, and, desc, avg, sql } from 'drizzle-orm';

@Injectable()
export class ReviewsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: string, courseId: string, rating: number, body?: string) {
    const [enrollment] = await this.drizzle.db
      .select({ id: enrollments.id, completedAt: enrollments.completedAt })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId)))
      .limit(1);

    if (!enrollment) throw new ForbiddenException('You must be enrolled to leave a review');
    if (!enrollment.completedAt) throw new ForbiddenException('Complete the course before reviewing');

    const existing = await this.drizzle.db
      .select({ id: courseReviews.id })
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.userId, userId)))
      .limit(1);

    if (existing[0]) throw new ConflictException('You have already reviewed this course');

    const [review] = await this.drizzle.db
      .insert(courseReviews)
      .values({ userId, courseId, rating, body })
      .returning();

    await this.recalculateRating(courseId);
    return review!;
  }

  async findByCourse(courseId: string, limit = 20, offset = 0) {
    return this.drizzle.db
      .select({
        id: courseReviews.id,
        rating: courseReviews.rating,
        body: courseReviews.body,
        createdAt: courseReviews.createdAt,
        reviewerName: users.name,
        reviewerAvatar: users.avatarUrl,
      })
      .from(courseReviews)
      .innerJoin(users, eq(users.id, courseReviews.userId))
      .where(eq(courseReviews.courseId, courseId))
      .orderBy(desc(courseReviews.createdAt))
      .limit(limit)
      .offset(offset);
  }

  private async recalculateRating(courseId: string) {
    const result = await this.drizzle.db
      .select({
        ratingAvg: avg(courseReviews.rating),
        ratingCount: sql<number>`COUNT(*)`,
      })
      .from(courseReviews)
      .where(eq(courseReviews.courseId, courseId));

    const row = result[0];
    if (!row) return;

    await this.drizzle.db
      .update(courses)
      .set({
        ratingAvg: row.ratingAvg ? String(parseFloat(row.ratingAvg).toFixed(2)) : null,
        ratingCount: Number(row.ratingCount),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));
  }
}
