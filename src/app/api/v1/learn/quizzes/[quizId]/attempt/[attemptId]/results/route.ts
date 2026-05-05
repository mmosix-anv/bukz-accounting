import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { getAttemptResults } from '@/lib/services/quiz.service';

export async function GET(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await getAttemptResults(params.attemptId, user.id)); }
  catch (e) { return err((e as Error).message, 404); }
}
