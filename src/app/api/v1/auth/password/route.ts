import { type NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@bukz/db';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) return unauthorized();

  let body: z.infer<typeof changePasswordSchema>;
  try {
    body = changePasswordSchema.parse(await req.json());
  } catch {
    return err('Invalid request');
  }

  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, authUser.id)).limit(1);
  if (!user?.passwordHash || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
    return err('Current password is incorrect', 400);
  }

  const passwordHash = await bcrypt.hash(body.newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, authUser.id));

  return ok({ success: true });
}
