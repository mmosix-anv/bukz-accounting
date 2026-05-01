import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import {
  courses,
  courseSections,
  courseLessons,
  courseCategories,
  users,
  enrollments,
} from '@bukz/db';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';

export interface CourseFilter {
  categorySlug?: string;
  level?: string[];
  priceMax?: number;
  cpdHoursMin?: number;
  sortBy?: 'newest' | 'rating' | 'enrollments' | 'recommended';
  limit?: number;
  offset?: number;
}

@Injectable()
export class CoursesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(filter: CourseFilter = {}) {
    const { level, priceMax, cpdHoursMin, sortBy = 'newest', limit = 20, offset = 0 } = filter;

    const conditions = [eq(courses.status, 'published')];
    if (level?.length) {
      conditions.push(
        sql`${courses.level} = ANY(ARRAY[${sql.join(level.map((l) => sql`${l}`), sql`, `)}]::text[])`,
      );
    }
    if (priceMax !== undefined) conditions.push(lte(courses.priceGbp, String(priceMax)));
    if (cpdHoursMin !== undefined) conditions.push(gte(courses.cpdHours, String(cpdHoursMin)));

    const orderBy =
      sortBy === 'rating'
        ? desc(courses.ratingAvg)
        : sortBy === 'enrollments'
          ? desc(courses.enrollmentsCount)
          : desc(courses.createdAt);

    const rows = await this.drizzle.db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        shortDescription: courses.shortDescription,
        thumbnailUrl: courses.thumbnailUrl,
        level: courses.level,
        priceGbp: courses.priceGbp,
        cpdHours: courses.cpdHours,
        enrollmentsCount: courses.enrollmentsCount,
        ratingAvg: courses.ratingAvg,
        ratingCount: courses.ratingCount,
        createdAt: courses.createdAt,
        instructorId: courses.instructorId,
        instructorName: users.name,
      })
      .from(courses)
      .leftJoin(users, eq(users.id, courses.instructorId))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return rows;
  }

  async findBySlug(slug: string, userId?: string) {
    const [course] = await this.drizzle.db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);

    if (!course) throw new NotFoundException(`Course not found: ${slug}`);

    const sections = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.courseId, course.id))
      .orderBy(asc(courseSections.position));

    const lessons = await this.drizzle.db
      .select()
      .from(courseLessons)
      .where(
        sql`${courseLessons.sectionId} IN (SELECT id FROM course_sections WHERE course_id = ${course.id})`,
      )
      .orderBy(asc(courseLessons.position));

    let isEnrolled = false;
    if (userId) {
      const [enrollment] = await this.drizzle.db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.courseId, course.id), eq(enrollments.userId, userId)))
        .limit(1);
      isEnrolled = !!enrollment;
    }

    const [instructor] = await this.drizzle.db
      .select({ name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, course.instructorId))
      .limit(1);

    const sectionsWithLessons = sections.map((s) => ({
      ...s,
      lessons: lessons
        .filter((l) => l.sectionId === s.id)
        .map((l) => ({
          ...l,
          content: isEnrolled || l.isFree ? l.content : null,
          videoUrl: isEnrolled || l.isFree ? l.videoUrl : null,
        })),
    }));

    return { ...course, sections: sectionsWithLessons, isEnrolled, instructor: instructor ?? null };
  }

  async findById(id: string) {
    const [course] = await this.drizzle.db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    if (!course) throw new NotFoundException(`Course not found: ${id}`);
    return course;
  }

  async create(instructorId: string, data: Omit<typeof courses.$inferInsert, 'instructorId' | 'slug'>) {
    const slug = this.slugify(data.title ?? '') + '-' + Date.now();
    const [course] = await this.drizzle.db
      .insert(courses)
      .values({ ...data, instructorId, slug, status: 'draft' })
      .returning();
    return course!;
  }

  async update(id: string, instructorId: string, data: Partial<typeof courses.$inferInsert>, isAdmin = false) {
    const existing = await this.findById(id);
    if (!isAdmin && existing.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }
    const [updated] = await this.drizzle.db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated!;
  }

  async publish(id: string, instructorId: string) {
    const existing = await this.findById(id);
    if (existing.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const sections = await this.drizzle.db
      .select({ id: courseSections.id })
      .from(courseSections)
      .where(eq(courseSections.courseId, id))
      .limit(1);

    if (!sections[0]) {
      throw new BadRequestException('Course must have at least one section before publishing');
    }

    const lessons = await this.drizzle.db
      .select({ id: courseLessons.id })
      .from(courseLessons)
      .where(eq(courseLessons.sectionId, sections[0].id))
      .limit(1);

    if (!lessons[0]) {
      throw new BadRequestException('Course must have at least one lesson before publishing');
    }

    const [updated] = await this.drizzle.db
      .update(courses)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated!;
  }

  async unpublish(id: string, instructorId: string) {
    const existing = await this.findById(id);
    if (existing.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }
    const [updated] = await this.drizzle.db
      .update(courses)
      .set({ status: 'draft', updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated!;
  }

  async getAnalytics(id: string, instructorId: string) {
    const course = await this.findById(id);
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const allEnrollments = await this.drizzle.db
      .select({
        id: enrollments.id,
        progressPercent: enrollments.progressPercent,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
      })
      .from(enrollments)
      .where(eq(enrollments.courseId, id));

    const completed = allEnrollments.filter((e) => e.completedAt !== null);
    const completionRate =
      allEnrollments.length > 0
        ? Math.round((completed.length / allEnrollments.length) * 100)
        : 0;

    const revenueGbp =
      Number(course.priceGbp) * allEnrollments.length;

    return {
      totalEnrollments: allEnrollments.length,
      completedEnrollments: completed.length,
      completionRate,
      revenueGbp,
      averageProgress:
        allEnrollments.length > 0
          ? Math.round(
              allEnrollments.reduce((s, e) => s + (e.progressPercent ?? 0), 0) /
                allEnrollments.length,
            )
          : 0,
    };
  }

  async createSection(courseId: string, instructorId: string, title: string) {
    const course = await this.findById(courseId);
    if (course.instructorId !== instructorId) throw new ForbiddenException('Not your course');

    const existingSections = await this.drizzle.db
      .select({ position: courseSections.position })
      .from(courseSections)
      .where(eq(courseSections.courseId, courseId))
      .orderBy(desc(courseSections.position))
      .limit(1);

    const nextPosition = (existingSections[0]?.position ?? 0) + 1;

    const [section] = await this.drizzle.db
      .insert(courseSections)
      .values({ courseId, title, position: nextPosition })
      .returning();
    return section!;
  }

  async updateSection(sectionId: string, instructorId: string, data: Partial<{ title: string; position: number }>) {
    const [section] = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, sectionId))
      .limit(1);
    if (!section) throw new NotFoundException('Section not found');

    const course = await this.findById(section.courseId);
    if (course.instructorId !== instructorId) throw new ForbiddenException('Not your course');

    const [updated] = await this.drizzle.db
      .update(courseSections)
      .set(data)
      .where(eq(courseSections.id, sectionId))
      .returning();
    return updated!;
  }

  async createLesson(
    sectionId: string,
    instructorId: string,
    data: Omit<typeof courseLessons.$inferInsert, 'sectionId' | 'position'>,
  ) {
    const [section] = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, sectionId))
      .limit(1);
    if (!section) throw new NotFoundException('Section not found');

    const course = await this.findById(section.courseId);
    if (course.instructorId !== instructorId) throw new ForbiddenException('Not your course');

    const existing = await this.drizzle.db
      .select({ position: courseLessons.position })
      .from(courseLessons)
      .where(eq(courseLessons.sectionId, sectionId))
      .orderBy(desc(courseLessons.position))
      .limit(1);

    const nextPosition = (existing[0]?.position ?? 0) + 1;

    const [lesson] = await this.drizzle.db
      .insert(courseLessons)
      .values({ ...data, sectionId, position: nextPosition })
      .returning();
    return lesson!;
  }

  async updateLesson(
    lessonId: string,
    instructorId: string,
    data: Partial<typeof courseLessons.$inferInsert>,
  ) {
    const [lesson] = await this.drizzle.db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .limit(1);
    if (!lesson) throw new NotFoundException('Lesson not found');

    const [section] = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, lesson.sectionId))
      .limit(1);
    if (!section) throw new NotFoundException('Section not found');

    const course = await this.findById(section.courseId);
    if (course.instructorId !== instructorId) throw new ForbiddenException('Not your course');

    const [updated] = await this.drizzle.db
      .update(courseLessons)
      .set(data)
      .where(eq(courseLessons.id, lessonId))
      .returning();
    return updated!;
  }

  async reorderLessons(sectionId: string, instructorId: string, orderedIds: string[]) {
    const [section] = await this.drizzle.db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, sectionId))
      .limit(1);
    if (!section) throw new NotFoundException('Section not found');

    const course = await this.findById(section.courseId);
    if (course.instructorId !== instructorId) throw new ForbiddenException('Not your course');

    await Promise.all(
      orderedIds.map((id, index) =>
        this.drizzle.db
          .update(courseLessons)
          .set({ position: index + 1 })
          .where(eq(courseLessons.id, id)),
      ),
    );

    return { reordered: orderedIds.length };
  }

  async getInstructorCourses(instructorId: string) {
    return this.drizzle.db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.createdAt));
  }

  async getCourseCategories() {
    return this.drizzle.db.select().from(courseCategories);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }
}
