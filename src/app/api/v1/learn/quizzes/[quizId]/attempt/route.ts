import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { startAttempt, getUserAttempts } from '@/lib/services/quiz.service';

export async function POST(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await startAttempt(user.id, params.quizId)); }
  catch (e) { return err((e as Error).message, 403); }
}

export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await getUserAttempts(user.id, params.quizId));
}
