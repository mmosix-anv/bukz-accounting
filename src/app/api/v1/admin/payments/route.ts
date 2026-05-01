import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden } from '@/lib/route-handler';
import { getAdminPayments } from '@/lib/services/admin.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  const { searchParams } = new URL(req.url);
  return ok(await getAdminPayments(Number(searchParams.get('limit') ?? 30), Number(searchParams.get('offset') ?? 0)));
}
