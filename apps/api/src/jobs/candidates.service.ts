import { Injectable, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { StorageService } from '../common/services/storage.service';
import { candidates } from '@bukz/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
  ) {}

  async findByUserId(userId: string) {
    const [candidate] = await this.drizzle.db
      .select()
      .from(candidates)
      .where(eq(candidates.userId, userId))
      .limit(1);
    return candidate ?? null;
  }

  async upsert(userId: string, data: Partial<typeof candidates.$inferInsert>) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      const [updated] = await this.drizzle.db
        .update(candidates)
        .set(data)
        .where(eq(candidates.userId, userId))
        .returning();
      return updated!;
    }
    const [created] = await this.drizzle.db
      .insert(candidates)
      .values({ ...data, userId })
      .returning();
    return created!;
  }

  async getCvUploadUrl(userId: string, filename: string, contentType: string) {
    if (contentType !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are accepted');
    }

    const key = `cvs/${userId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const uploadUrl = await this.storage.getPresignedUploadUrl(key, contentType, 300);
    const publicUrl = this.storage.getPublicUrl(key);

    return { uploadUrl, key, publicUrl };
  }

  async confirmCvUpload(userId: string, key: string, filename: string) {
    const publicUrl = this.storage.getPublicUrl(key);
    return this.upsert(userId, { cvUrl: publicUrl, cvFilename: filename });
  }
}
