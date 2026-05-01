import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function getAuthUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  return user ?? null;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export const unauthorized = () => err('Unauthorized', 401);
export const forbidden = () => err('Forbidden', 403);
export const notFound = (resource = 'Resource') => err(`${resource} not found`, 404);
