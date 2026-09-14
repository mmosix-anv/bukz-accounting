import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  revalidateTag('platform-settings');
  return NextResponse.json({ revalidated: true });
}
