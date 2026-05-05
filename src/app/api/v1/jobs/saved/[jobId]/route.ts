import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { unsaveJob, isJobSaved } from '@/lib/services/saved-jobs.service';

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok({ saved: await isJobSaved(user.id, params.jobId) });
}

export async function DELETE(req: NextRequest, { params }: { params: { jobId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await unsaveJob(user.id, params.jobId)); }
  catch (e) { return err((e as Error).message); }
}
