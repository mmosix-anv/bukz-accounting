import { type NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@bukz/db';
import { email as mailer } from '@/lib/email';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const email = req.nextUrl.searchParams.get('email');
  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid_token', req.url));
  }

  const [vt] = await db
    .select()
    .from(verificationTokens)
    .where(and(
      eq(verificationTokens.identifier, email),
      eq(verificationTokens.token, token),
      eq(verificationTokens.purpose, 'email_verify'),
    ))
    .limit(1);

  if (!vt || vt.expires < new Date()) {
    return NextResponse.redirect(new URL(`/auth/verify-email?email=${encodeURIComponent(email)}&error=invalid_token`, req.url));
  }

  const [user] = await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email)).returning({ name: users.name, role: users.role });
  await db.delete(verificationTokens).where(and(
    eq(verificationTokens.identifier, email),
    eq(verificationTokens.token, token),
  ));

  if (user) {
    await mailer.sendWelcome(email, user.name, user.role).catch(() => undefined);
  }

  return NextResponse.redirect(new URL('/auth/login?verified=1', req.url));
}
