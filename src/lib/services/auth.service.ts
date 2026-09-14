import { db } from '@/lib/db';
import { users, profiles } from '@bukz/db';
import { eq } from 'drizzle-orm';

export async function getMe(userId: string) {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: users.role,
      createdAt: users.createdAt,
      bio: profiles.bio,
      location: profiles.location,
      phone: profiles.phone,
      linkedinUrl: profiles.linkedinUrl,
      websiteUrl: profiles.websiteUrl,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result) throw new Error('User not found');
  return result;
}

export async function updateProfile(userId: string, data: { bio?: string; location?: string; phone?: string; linkedinUrl?: string; websiteUrl?: string }) {
  await db.update(profiles).set(data).where(eq(profiles.userId, userId));
  return getMe(userId);
}

export async function updateUser(userId: string, data: { name?: string; avatarUrl?: string }) {
  await db.update(users).set(data).where(eq(users.id, userId));
  return getMe(userId);
}
