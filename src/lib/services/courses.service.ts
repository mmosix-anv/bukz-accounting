import { db } from '@/lib/db';
import { courses, courseSections, courseLessons, courseCategories, users, enrollments } from '@bukz/db';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';

export interface CourseFilter {
  level?: string[];
  priceMax?: number;
  cpdHoursMin?: number;
  sortBy?: 'newest' | 'rating' | 'enrollments';
  limit?: number;
  offset?: number;
}

export async function findAllCourses(filter: CourseFilter = {}) {
  const { level, priceMax, cpdHoursMin, sortBy = 'newest', limit = 20, offset = 0 } = filter;
  const conditions: ReturnType<typeof eq>[] = [eq(courses.status, 'published')];

  if (level?.length) conditions.push(sql`${courses.level} = ANY(ARRAY[${sql.join(level.map((l) => sql`${l}`), sql`, `)}]::text[])`);
  if (priceMax !== undefined) conditions.push(lte(courses.priceGbp, String(priceMax)));
  if (cpdHoursMin !== undefined) conditions.push(gte(courses.cpdHours, String(cpdHoursMin)));

  const orderBy = sortBy === 'rating' ? desc(courses.ratingAvg) : sortBy === 'enrollments' ? desc(courses.enrollmentsCount) : desc(courses.createdAt);

  return db
    .select({
      id: courses.id, title: courses.title, slug: courses.slug, shortDescription: courses.shortDescription,
      thumbnailUrl: courses.thumbnailUrl, level: courses.level, priceGbp: courses.priceGbp,
      cpdHours: courses.cpdHours, enrollmentsCount: courses.enrollmentsCount, ratingAvg: courses.ratingAvg,
      ratingCount: courses.ratingCount, createdAt: courses.createdAt, instructorId: courses.instructorId,
      instructorName: users.name,
    })
    .from(courses)
    .leftJoin(users, eq(users.id, courses.instructorId))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
}

export async function findCourseBySlug(slug: string, userId?: string) {
  const [course] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  if (!course) throw new Error(`Course not found: ${slug}`);

  const sections = await db.select().from(courseSections).where(eq(courseSections.courseId, course.id)).orderBy(asc(courseSections.position));
  const lessons = await db.select().from(courseLessons)
    .where(sql`${courseLessons.sectionId} IN (SELECT id FROM course_sections WHERE course_id = ${course.id})`)
    .orderBy(asc(courseLessons.position));

  let isEnrolled = false;
  if (userId) {
    const [enrollment] = await db.select({ id: enrollments.id }).from(enrollments)
      .where(and(eq(enrollments.courseId, course.id), eq(enrollments.userId, userId))).limit(1);
    isEnrolled = !!enrollment;
  }

  const [instructor] = await db.select({ name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, course.instructorId)).limit(1);

  const sectionsWithLessons = sections.map((s) => ({
    ...s,
    lessons: lessons
      .filter((l) => l.sectionId === s.id)
      .map((l) => ({ ...l, content: isEnrolled || l.isFree ? l.content : null, videoUrl: isEnrolled || l.isFree ? l.videoUrl : null })),
  }));

  return { ...course, sections: sectionsWithLessons, isEnrolled, instructor: instructor ?? null };
}

export async function findCourseById(id: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course) throw new Error(`Course not found: ${id}`);
  return course;
}

export async function createCourse(instructorId: string, data: Omit<typeof courses.$inferInsert, 'instructorId' | 'slug'>) {
  const slug = slugify(data.title ?? '') + '-' + Date.now();
  const [course] = await db.insert(courses).values({ ...data, instructorId, slug, status: 'draft' }).returning();
  return course!;
}

export async function updateCourse(id: string, instructorId: string, data: Partial<typeof courses.$inferInsert>, isAdmin = false) {
  const existing = await findCourseById(id);
  if (!isAdmin && existing.instructorId !== instructorId) throw new Error('You do not own this course');
  const [updated] = await db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
  return updated!;
}

export async function publishCourse(id: string, instructorId: string) {
  const existing = await findCourseById(id);
  if (existing.instructorId !== instructorId) throw new Error('You do not own this course');

  const [section] = await db.select({ id: courseSections.id }).from(courseSections).where(eq(courseSections.courseId, id)).limit(1);
  if (!section) throw new Error('Course must have at least one section');

  const [lesson] = await db.select({ id: courseLessons.id }).from(courseLessons).where(eq(courseLessons.sectionId, section.id)).limit(1);
  if (!lesson) throw new Error('Course must have at least one lesson');

  const [updated] = await db.update(courses).set({ status: 'published', updatedAt: new Date() }).where(eq(courses.id, id)).returning();
  return updated!;
}

export async function createSection(courseId: string, instructorId: string, title: string) {
  const course = await findCourseById(courseId);
  if (course.instructorId !== instructorId) throw new Error('Not your course');

  const [last] = await db.select({ position: courseSections.position }).from(courseSections)
    .where(eq(courseSections.courseId, courseId)).orderBy(desc(courseSections.position)).limit(1);

  const [section] = await db.insert(courseSections).values({ courseId, title, position: (last?.position ?? 0) + 1 }).returning();
  return section!;
}

export async function updateSection(sectionId: string, instructorId: string, data: Partial<{ title: string; position: number }>) {
  const [section] = await db.select().from(courseSections).where(eq(courseSections.id, sectionId)).limit(1);
  if (!section) throw new Error('Section not found');
  const course = await findCourseById(section.courseId);
  if (course.instructorId !== instructorId) throw new Error('Not your course');
  const [updated] = await db.update(courseSections).set(data).where(eq(courseSections.id, sectionId)).returning();
  return updated!;
}

export async function createLesson(sectionId: string, instructorId: string, data: Omit<typeof courseLessons.$inferInsert, 'sectionId' | 'position'>) {
  const [section] = await db.select().from(courseSections).where(eq(courseSections.id, sectionId)).limit(1);
  if (!section) throw new Error('Section not found');
  const course = await findCourseById(section.courseId);
  if (course.instructorId !== instructorId) throw new Error('Not your course');

  const [last] = await db.select({ position: courseLessons.position }).from(courseLessons)
    .where(eq(courseLessons.sectionId, sectionId)).orderBy(desc(courseLessons.position)).limit(1);

  const [lesson] = await db.insert(courseLessons).values({ ...data, sectionId, position: (last?.position ?? 0) + 1 }).returning();
  return lesson!;
}

export async function updateLesson(lessonId: string, instructorId: string, data: Partial<typeof courseLessons.$inferInsert>) {
  const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId)).limit(1);
  if (!lesson) throw new Error('Lesson not found');
  const [section] = await db.select().from(courseSections).where(eq(courseSections.id, lesson.sectionId)).limit(1);
  if (!section) throw new Error('Section not found');
  const course = await findCourseById(section.courseId);
  if (course.instructorId !== instructorId) throw new Error('Not your course');
  const [updated] = await db.update(courseLessons).set(data).where(eq(courseLessons.id, lessonId)).returning();
  return updated!;
}

export async function getInstructorCourses(instructorId: string) {
  return db.select().from(courses).where(eq(courses.instructorId, instructorId)).orderBy(desc(courses.createdAt));
}

export const getCourseCategories = () => db.select().from(courseCategories);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
