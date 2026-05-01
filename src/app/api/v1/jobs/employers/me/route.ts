import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { getEmployerProfile, updateEmployerProfile, getEmployerListings, getEmployerStats } from '@/lib/services/employers.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view');
  if (view === 'listings') return ok(await getEmployerListings(user.id));
  if (view === 'stats') return ok(await getEmployerStats(user.id));
  return ok(await getEmployerProfile(user.id));
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof updateEmployerProfile>[1];
    return ok(await updateEmployerProfile(user.id, body));
  } catch (e) { return err((e as Error).message); }
}
