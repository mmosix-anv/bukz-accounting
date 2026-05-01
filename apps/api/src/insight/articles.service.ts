import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { articles } from '@bukz/db';
import { eq, desc, and, or, like } from 'drizzle-orm';

@Injectable()
export class ArticlesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(limit = 20, offset = 0, categoryId?: string, search?: string, featuredFirst = true) {
    const orderByClause = featuredFirst ? desc(articles.publishedAt) : desc(articles.createdAt);

    let query = this.drizzle.db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    if (categoryId) {
      query = this.drizzle.db
        .select()
        .from(articles)
        .where(and(eq(articles.status, 'published'), eq(articles.categoryId, categoryId)))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
    }

    if (search) {
      query = this.drizzle.db
        .select()
        .from(articles)
        .where(and(eq(articles.status, 'published'), or(like(articles.title, `%${search}%`), like(articles.excerpt, `%${search}%`))))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
    }

    if (categoryId && search) {
      query = this.drizzle.db
        .select()
        .from(articles)
        .where(and(eq(articles.status, 'published'), eq(articles.categoryId, categoryId), or(like(articles.title, `%${search}%`), like(articles.excerpt, `%${search}%`))))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
    }

    return query;
  }

  async findBySlug(slug: string) {
    const [article] = await this.drizzle.db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);
    if (!article) throw new NotFoundException('Article not found');
    await this.drizzle.db
      .update(articles)
      .set({ viewCount: (article.viewCount ?? 0) + 1 })
      .where(eq(articles.id, article.id));
    return article;
  }

  async create(data: typeof articles.$inferInsert) {
    const [article] = await this.drizzle.db.insert(articles).values(data).returning();
    return article;
  }

  async update(id: string, data: Partial<typeof articles.$inferInsert>, userId: string, isAdmin: boolean) {
    const [existing] = await this.drizzle.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Article not found');
    if (!isAdmin && existing.authorId !== userId) throw new ForbiddenException('Not authorized');
    const [article] = await this.drizzle.db.update(articles).set(data).where(eq(articles.id, id)).returning();
    return article;
  }

  async publish(id: string, userId: string, isAdmin: boolean) {
    const [existing] = await this.drizzle.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Article not found');
    if (!isAdmin && existing.authorId !== userId) throw new ForbiddenException('Not authorized');
    const [article] = await this.drizzle.db
      .update(articles)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }
}
