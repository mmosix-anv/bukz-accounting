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
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './auth';

export const articleStatusEnum = pgEnum('article_status', ['draft', 'published']);

export const articleCategories = pgTable('article_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  colourHex: text('colour_hex').notNull().default('#0D1B3E'),
});

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  categoryId: uuid('category_id').references(() => articleCategories.id),
  status: articleStatusEnum('status').notNull().default('draft'),
  featuredImageUrl: text('featured_image_url'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const experts = pgTable('experts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  specialisations: text('specialisations').array().notNull().default(sql`'{}'::text[]`),
  qualifications: text('qualifications').array().notNull().default(sql`'{}'::text[]`),
  bio: text('bio').notNull(),
  avatarUrl: text('avatar_url'),
  hourlyRateGbp: numeric('hourly_rate_gbp', { precision: 10, scale: 2 }),
  calUsername: text('cal_username'),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
});

export const bookmarks = pgTable('bookmarks', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export const insertExpertSchema = createInsertSchema(experts);
export const selectExpertSchema = createSelectSchema(experts);
