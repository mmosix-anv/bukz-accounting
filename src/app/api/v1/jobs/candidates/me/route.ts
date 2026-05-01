import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findCandidateByUserId, upsertCandidate } from '@/lib/services/candidates.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await findCandidateByUserId(user.id));
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof upsertCandidate>[1];
    return ok(await upsertCandidate(user.id, body));
  } catch (e) { return err((e as Error).message); }
}
