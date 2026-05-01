import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized } from '@/lib/route-handler';
import { getEmployerSubscription } from '@/lib/services/payments.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await getEmployerSubscription(user.id));
}
