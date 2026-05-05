import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './auth';

export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced']);

export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

export const courseCategories = pgTable('course_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentId: uuid('parent_id'),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  categoryId: uuid('category_id').references(() => courseCategories.id),
  level: courseLevelEnum('level').notNull(),
  priceGbp: numeric('price_gbp', { precision: 10, scale: 2 }).notNull(),
  cpdHours: numeric('cpd_hours', { precision: 5, scale: 1 }).notNull(),
  status: courseStatusEnum('status').notNull().default('draft'),
  enrollmentsCount: integer('enrollments_count').notNull().default(0),
  ratingAvg: numeric('rating_avg', { precision: 3, scale: 2 }),
  ratingCount: integer('rating_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const courseSections = pgTable('course_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull(),
});

export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => courseSections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  videoUrl: text('video_url'),
  durationMinutes: integer('duration_minutes'),
  position: integer('position').notNull(),
  isFree: boolean('is_free').notNull().default(false),
});

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  progressPercent: integer('progress_percent').notNull().default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const lessonProgress = pgTable('lesson_progress', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => courseLessons.id, { onDelete: 'cascade' }),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
});

export const courseCertificates = pgTable('course_certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  issuedAt: timestamp('issued_at').notNull().defaultNow(),
  certificateUrl: text('certificate_url'),
});

export const courseReviews = pgTable('course_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const cpdLog = pgTable('cpd_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id),
  hours: numeric('hours', { precision: 5, scale: 1 }).notNull(),
  activityDescription: text('activity_description').notNull(),
  loggedAt: timestamp('logged_at').notNull().defaultNow(),
});

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').references(() => courseLessons.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  passingScore: integer('passing_score').notNull().default(70),
  timeLimitMinutes: integer('time_limit_minutes'),
  maxAttempts: integer('max_attempts'),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const quizQuestionTypeEnum = pgEnum('quiz_question_type', [
  'multiple_choice',
  'true_false',
  'multi_select',
]);

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: quizQuestionTypeEnum('question_type').notNull().default('multiple_choice'),
  points: integer('points').notNull().default(1),
  position: integer('position').notNull(),
  explanation: text('explanation'),
});

export const quizOptions = pgTable('quiz_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  position: integer('position').notNull(),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score'),
  totalPoints: integer('total_points'),
  passed: boolean('passed'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const quizAnswers = pgTable('quiz_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  selectedOptionIds: text('selected_option_ids').array().notNull().default([]),
  isCorrect: boolean('is_correct'),
  pointsAwarded: integer('points_awarded').notNull().default(0),
});

export const insertCourseSchema = createInsertSchema(courses);
export const selectCourseSchema = createSelectSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const selectEnrollmentSchema = createSelectSchema(enrollments);
export const insertCourseReviewSchema = createInsertSchema(courseReviews);
export const selectCourseReviewSchema = createSelectSchema(courseReviews);
export const insertCpdLogSchema = createInsertSchema(cpdLog);
export const selectCpdLogSchema = createSelectSchema(cpdLog);
export const insertQuizSchema = createInsertSchema(quizzes);
export const selectQuizSchema = createSelectSchema(quizzes);
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export const insertQuizOptionSchema = createInsertSchema(quizOptions);
