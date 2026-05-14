import { db } from '@/lib/db';
import { articles, articleCategories } from '@bukz/db';
import { eq, desc, and, or, like } from 'drizzle-orm';

export async function findAllArticleCategories() {
  return db.select().from(articleCategories).orderBy(articleCategories.name);
}

export async function findAllArticles(limit = 20, offset = 0, categoryId?: string, search?: string) {
  const baseConditions = [eq(articles.status, 'published')];
  const categoryCondition = categoryId ? [eq(articles.categoryId, categoryId)] : [];
  const searchCondition = search ? [or(like(articles.title, `%${search}%`), like(articles.excerpt, `%${search}%`))] : [];

  const conditions = [...baseConditions, ...categoryCondition, ...searchCondition].filter(Boolean);

  return db.select({
    id: articles.id,
    authorId: articles.authorId,
    title: articles.title,
    slug: articles.slug,
    excerpt: articles.excerpt,
    categoryId: articles.categoryId,
    categoryName: articleCategories.name,
    status: articles.status,
    featuredImageUrl: articles.featuredImageUrl,
    seoTitle: articles.seoTitle,
    seoDescription: articles.seoDescription,
    publishedAt: articles.publishedAt,
    viewCount: articles.viewCount,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
  })
    .from(articles)
    .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(and(...(conditions as [ReturnType<typeof eq>, ...ReturnType<typeof eq>[]])))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function findArticleBySlug(slug: string) {
  const [row] = await db.select({
    id: articles.id,
    authorId: articles.authorId,
    title: articles.title,
    slug: articles.slug,
    excerpt: articles.excerpt,
    content: articles.content,
    categoryId: articles.categoryId,
    categoryName: articleCategories.name,
    status: articles.status,
    featuredImageUrl: articles.featuredImageUrl,
    seoTitle: articles.seoTitle,
    seoDescription: articles.seoDescription,
    publishedAt: articles.publishedAt,
    viewCount: articles.viewCount,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
  })
    .from(articles)
    .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!row) throw new Error('Article not found');
  await db.update(articles).set({ viewCount: (row.viewCount ?? 0) + 1 }).where(eq(articles.id, row.id));
  return row;
}

export async function createArticle(data: typeof articles.$inferInsert) {
  const [article] = await db.insert(articles).values(data).returning();
  return article;
}

export async function updateArticle(id: string, data: Partial<typeof articles.$inferInsert>, userId: string, isAdmin: boolean) {
  const [existing] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!existing) throw new Error('Article not found');
  if (!isAdmin && existing.authorId !== userId) throw new Error('Not authorized');
  const [article] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
  return article;
}

export async function publishArticle(id: string, userId: string, isAdmin: boolean) {
  const [existing] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!existing) throw new Error('Article not found');
  if (!isAdmin && existing.authorId !== userId) throw new Error('Not authorized');
  const [article] = await db.update(articles).set({ status: 'published', publishedAt: new Date() }).where(eq(articles.id, id)).returning();
  return article;
}
