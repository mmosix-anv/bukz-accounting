import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized } from '@/lib/route-handler';
import { findApplicationsByEmployer } from '@/lib/services/job-applications.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const status = new URL(req.url).searchParams.get('status') ?? undefined;
  return ok(await findApplicationsByEmployer(user.id, status));
}
