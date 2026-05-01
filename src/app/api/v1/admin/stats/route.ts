import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden } from '@/lib/route-handler';
import { getAdminStats } from '@/lib/services/admin.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  return ok(await getAdminStats());
}
