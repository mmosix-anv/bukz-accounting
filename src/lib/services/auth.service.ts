import { db } from '@/lib/db';
import { email } from '@/lib/email';
import { users, profiles } from '@bukz/db';
import { eq } from 'drizzle-orm';

export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
};

export async function syncUser(supabaseUser: SupabaseUser) {
  const existing = await db.select().from(users).where(eq(users.id, supabaseUser.id)).limit(1);

  if (existing.length === 0) {
    const role = (supabaseUser.user_metadata['role'] as string) ?? 'candidate';
    const validRoles = ['candidate', 'employer', 'instructor', 'admin'] as const;
    const safeRole = validRoles.includes(role as (typeof validRoles)[number])
      ? (role as (typeof validRoles)[number])
      : 'candidate';

    await db.insert(users).values({
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: (supabaseUser.user_metadata['name'] as string) ?? '',
      avatarUrl: supabaseUser.user_metadata['avatar_url'] as string | undefined,
      role: safeRole,
    });

    await db.insert(profiles).values({ userId: supabaseUser.id });

    email.sendWelcome(
      supabaseUser.email,
      (supabaseUser.user_metadata['name'] as string) ?? 'there',
      (supabaseUser.user_metadata['role'] as string) ?? 'candidate',
    ).catch(() => undefined);
  }

  return getMe(supabaseUser.id);
}

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
