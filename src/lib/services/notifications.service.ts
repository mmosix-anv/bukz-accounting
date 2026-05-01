import { db } from '@/lib/db';
import { notifications } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';

export async function findNotificationsByUser(userId: string, limit = 10) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationRead(id: string) {
  const [n] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
  return n;
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}

export async function createNotification(data: typeof notifications.$inferInsert) {
  const [n] = await db.insert(notifications).values(data).returning();
  return n;
}
