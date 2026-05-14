import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

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

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!applyRateLimit(request)) {
      return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const protectedPrefixes = ['/dashboard', '/employers', '/onboarding'];
  const adminPrefix = '/admin';

  if (!user && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith(adminPrefix)) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    const role = user.user_metadata?.['role'];
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
};
