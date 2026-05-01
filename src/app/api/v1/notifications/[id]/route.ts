import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { markNotificationRead } from '@/lib/services/notifications.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await markNotificationRead(params.id)); }
  catch (e) { return err((e as Error).message); }
}
