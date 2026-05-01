import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { getMyCpdLog, logManualCpd } from '@/lib/services/cpd.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await getMyCpdLog(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as { hours: number; activityDescription: string; loggedAt?: string };
    return ok(await logManualCpd(user.id, { ...body, loggedAt: body.loggedAt ? new Date(body.loggedAt) : undefined }), 201);
  } catch (e) { return err((e as Error).message); }
}
