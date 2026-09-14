'use server';

import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import { users, profiles, verificationTokens } from '@bukz/db';
import { signIn, signOut } from '@/auth';
import { email as mailer } from '@/lib/email';
import { logger } from '@/lib/logger';

const APP_URL = process.env['NEXT_PUBLIC_APP_URL'];

export async function loginAction(formData: FormData): Promise<{ error?: string; redirectTo?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' };
    }
    logger.error('loginAction failed', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return { redirectTo };
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as 'candidate' | 'employer' | 'instructor';

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: 'An account with this email address already exists.' };

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ email, name, role, passwordHash }).returning({ id: users.id });
  await db.insert(profiles).values({ userId: user!.id });

  const token = randomUUID();
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    purpose: 'email_verify',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await mailer.sendVerification(email, name, `${APP_URL}/auth/verify-email/confirm?token=${token}&email=${encodeURIComponent(email)}`);

  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect('/');
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const token = randomUUID();
    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      purpose: 'password_reset',
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
    await mailer.sendPasswordReset(email, user.name, `${APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
  }

  // Always report success, even if the email wasn't found, to avoid leaking which emails are registered.
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const [vt] = await db
    .select()
    .from(verificationTokens)
    .where(and(
      eq(verificationTokens.identifier, email),
      eq(verificationTokens.token, token),
      eq(verificationTokens.purpose, 'password_reset'),
    ))
    .limit(1);

  if (!vt || vt.expires < new Date()) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.email, email));
  await db.delete(verificationTokens).where(and(
    eq(verificationTokens.identifier, email),
    eq(verificationTokens.token, token),
  ));

  redirect('/auth/login?reset=1');
}
