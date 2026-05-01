import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { experts } from '@bukz/db';
import { eq, like, and } from 'drizzle-orm';

@Injectable()
export class ExpertsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(specialisation?: string) {
    const conditions = [eq(experts.isActive, true)];
    if (specialisation) {
      conditions.push(like(experts.specialisations, `%${specialisation}%`));
    }
    return this.drizzle.db.select().from(experts).where(and(...conditions));
  }

  async findByUsername(username: string) {
    const [expert] = await this.drizzle.db
      .select()
      .from(experts)
      .where(eq(experts.calUsername, username))
      .limit(1);
    if (!expert) throw new NotFoundException('Expert not found');
    return expert;
  }

  async findByUserId(userId: string) {
    const [expert] = await this.drizzle.db
      .select()
      .from(experts)
      .where(eq(experts.userId, userId))
      .limit(1);
    return expert;
  }

  async create(data: typeof experts.$inferInsert) {
    const [expert] = await this.drizzle.db.insert(experts).values(data).returning();
    return expert;
  }

  async update(id: string, data: Partial<typeof experts.$inferInsert>, userId: string, isAdmin: boolean) {
    const [existing] = await this.drizzle.db.select().from(experts).where(eq(experts.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Expert not found');
    if (!isAdmin && existing.userId !== userId) throw new ForbiddenException('Not authorized');
    const [expert] = await this.drizzle.db.update(experts).set(data).where(eq(experts.id, id)).returning();
    return expert;
  }
}
