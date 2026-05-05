import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createEmployerSubscriptionCheckout } from '@/lib/services/payments.service';
import type { EmployerSubscriptionTierId } from '@bukz/db';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { tier } = await req.json() as { tier: Exclude<EmployerSubscriptionTierId, 'free'> };
    const session = await createEmployerSubscriptionCheckout(user.id, tier, user.email);
    return ok({ url: session.url });
  } catch (e) { return err((e as Error).message); }
}
