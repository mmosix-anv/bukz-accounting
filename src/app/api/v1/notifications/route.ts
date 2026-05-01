import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized } from '@/lib/route-handler';
import { findNotificationsByUser, markAllNotificationsRead } from '@/lib/services/notifications.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const limit = Number(new URL(req.url).searchParams.get('limit') ?? 10);
  return ok(await findNotificationsByUser(user.id, limit));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  await markAllNotificationsRead(user.id);
  return ok({ success: true });
}
