import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createJobPostingCheckout } from '@/lib/services/payments.service';
import type { JobPostingPackageId } from '@bukz/db';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { packageType } = await req.json() as { packageType: JobPostingPackageId };
    const session = await createJobPostingCheckout(user.id, packageType);
    return ok({ url: session.url });
  } catch (e) { return err((e as Error).message); }
}
