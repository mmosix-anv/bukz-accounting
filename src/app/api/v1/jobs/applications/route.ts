import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { applyToJob, findApplicationsByCandidate } from '@/lib/services/job-applications.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await findApplicationsByCandidate(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { jobId, coverLetter } = await req.json() as { jobId: string; coverLetter?: string };
    return ok(await applyToJob(user.id, jobId, coverLetter), 201);
  } catch (e) { return err((e as Error).message); }
}
