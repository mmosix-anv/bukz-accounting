import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { updateApplicationStatus } from '@/lib/services/job-applications.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { status } = await req.json() as { status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'offered' };
    return ok(await updateApplicationStatus(user.id, params.id, status));
  } catch (e) { return err((e as Error).message); }
}
