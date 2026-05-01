import { db } from '@/lib/db';
import { getPresignedUploadUrl, getPublicUrl } from '@/lib/storage';
import { candidates } from '@bukz/db';
import { eq } from 'drizzle-orm';

export async function findCandidateByUserId(userId: string) {
  const [candidate] = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
  return candidate ?? null;
}

export async function upsertCandidate(userId: string, data: Partial<typeof candidates.$inferInsert>) {
  const existing = await findCandidateByUserId(userId);
  if (existing) {
    const [updated] = await db.update(candidates).set(data).where(eq(candidates.userId, userId)).returning();
    return updated!;
  }
  const [created] = await db.insert(candidates).values({ ...data, userId }).returning();
  return created!;
}

export async function getCvUploadUrl(userId: string, filename: string, contentType: string) {
  if (contentType !== 'application/pdf') throw new Error('Only PDF files are accepted');
  const key = `cvs/${userId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const uploadUrl = await getPresignedUploadUrl(key, contentType, 300);
  const publicUrl = getPublicUrl(key);
  return { uploadUrl, key, publicUrl };
}

export async function confirmCvUpload(userId: string, key: string, filename: string) {
  return upsertCandidate(userId, { cvUrl: getPublicUrl(key), cvFilename: filename });
}
