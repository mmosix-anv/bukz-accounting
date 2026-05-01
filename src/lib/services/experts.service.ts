import { db } from '@/lib/db';
import { experts } from '@bukz/db';
import { eq, like, and } from 'drizzle-orm';

export async function findAllExperts(specialisation?: string) {
  const conditions: ReturnType<typeof eq>[] = [eq(experts.isActive, true)];
  if (specialisation) conditions.push(like(experts.specialisations, `%${specialisation}%`));
  return db.select().from(experts).where(and(...conditions));
}

export async function findExpertByUsername(username: string) {
  const [expert] = await db.select().from(experts).where(eq(experts.calUsername, username)).limit(1);
  if (!expert) throw new Error('Expert not found');
  return expert;
}

export async function findExpertByUserId(userId: string) {
  const [expert] = await db.select().from(experts).where(eq(experts.userId, userId)).limit(1);
  return expert ?? null;
}

export async function createExpert(data: typeof experts.$inferInsert) {
  const [expert] = await db.insert(experts).values(data).returning();
  return expert;
}

export async function updateExpert(id: string, data: Partial<typeof experts.$inferInsert>, userId: string, isAdmin: boolean) {
  const [existing] = await db.select().from(experts).where(eq(experts.id, id)).limit(1);
  if (!existing) throw new Error('Expert not found');
  if (!isAdmin && existing.userId !== userId) throw new Error('Not authorized');
  const [expert] = await db.update(experts).set(data).where(eq(experts.id, id)).returning();
  return expert;
}
