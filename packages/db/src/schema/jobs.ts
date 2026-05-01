import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './auth';

const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});

export const jobTypeEnum = pgEnum('job_type', [
  'full_time',
  'part_time',
  'contract',
  'interim',
  'graduate',
]);

export const experienceLevelEnum = pgEnum('experience_level', [
  'entry',
  'mid',
  'senior',
  'director',
  'cfo',
]);

export const remotePolicyEnum = pgEnum('remote_policy', ['office', 'hybrid', 'remote']);

export const jobStatusEnum = pgEnum('job_status', ['draft', 'active', 'expired', 'filled']);

export const applicationStatusEnum = pgEnum('application_status', [
  'submitted',
  'viewed',
  'shortlisted',
  'rejected',
  'offered',
]);

export const jobCategories = pgTable('job_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentId: uuid('parent_id'),
});

export const jobListings = pgTable('job_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerId: uuid('employer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  categoryId: uuid('category_id').references(() => jobCategories.id),
  location: text('location').notNull(),
  salaryMin: numeric('salary_min', { precision: 10, scale: 2 }),
  salaryMax: numeric('salary_max', { precision: 10, scale: 2 }),
  salaryCurrency: text('salary_currency').notNull().default('GBP'),
  jobType: jobTypeEnum('job_type').notNull(),
  experienceLevel: experienceLevelEnum('experience_level').notNull(),
  remotePolicy: remotePolicyEnum('remote_policy').notNull(),
  qualifications: text('qualifications').array().notNull().default(sql`'{}'::text[]`),
  softwareSkills: text('software_skills').array().notNull().default(sql`'{}'::text[]`),
  status: jobStatusEnum('status').notNull().default('draft'),
  expiresAt: timestamp('expires_at'),
  viewsCount: integer('views_count').notNull().default(0),
  applicationsCount: integer('applications_count').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  embedding: vector('embedding'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  cvUrl: text('cv_url'),
  cvFilename: text('cv_filename'),
  headline: text('headline'),
  yearsExperience: integer('years_experience'),
  currentSalary: numeric('current_salary', { precision: 10, scale: 2 }),
  desiredSalary: numeric('desired_salary', { precision: 10, scale: 2 }),
  noticePeriod: text('notice_period'),
  qualifications: text('qualifications').array().notNull().default(sql`'{}'::text[]`),
  softwareSkills: text('software_skills').array().notNull().default(sql`'{}'::text[]`),
  openToWork: boolean('open_to_work').notNull().default(true),
  embedding: vector('embedding'),
});

export const jobApplications = pgTable('job_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobListings.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidates.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').notNull().default('submitted'),
  coverLetter: text('cover_letter'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const savedJobs = pgTable('saved_jobs', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobListings.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertJobListingSchema = createInsertSchema(jobListings);
export const selectJobListingSchema = createSelectSchema(jobListings);
export const insertCandidateSchema = createInsertSchema(candidates);
export const selectCandidateSchema = createSelectSchema(candidates);
export const insertJobApplicationSchema = createInsertSchema(jobApplications);
export const selectJobApplicationSchema = createSelectSchema(jobApplications);
