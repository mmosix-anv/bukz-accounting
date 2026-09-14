import NextAuth from 'next-auth';
import { NextResponse, type NextRequest, type NextMiddleware } from 'next/server';
import { authConfig } from '@/auth.config';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function applyRateLimit(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown-ip';
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}

const { auth } = NextAuth(authConfig);

const middleware: NextMiddleware = auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/')) {
    if (!applyRateLimit(request)) {
      return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
    }
  }

  const session = request.auth;
  const protectedPrefixes = ['/dashboard', '/employers', '/onboarding'];
  const adminPrefix = '/admin';

  if (!session?.user && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith(adminPrefix)) {
    if (!session?.user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
};
