import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function getAuthUser(_req?: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
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
