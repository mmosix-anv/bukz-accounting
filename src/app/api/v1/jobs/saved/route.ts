import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { saveJob, getSavedJobs } from '@/lib/services/saved-jobs.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await getSavedJobs(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { jobId } = await req.json() as { jobId: string };
    return ok(await saveJob(user.id, jobId));
  } catch (e) { return err((e as Error).message); }
}
