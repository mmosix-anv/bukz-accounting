import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  revalidateTag('platform-settings');
  return NextResponse.json({ revalidated: true });
}
