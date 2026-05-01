import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { notifications } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findByUser(userId: string, limit = 10) {
    return this.drizzle.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markRead(id: string) {
    const [notification] = await this.drizzle.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllRead(userId: string) {
    await this.drizzle.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async create(data: typeof notifications.$inferInsert) {
    const [notification] = await this.drizzle.db.insert(notifications).values(data).returning();
    return notification;
  }
}
