import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { publishQuiz } from '@/lib/services/quiz.service';

export async function POST(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try { return ok(await publishQuiz(params.quizId)); }
  catch (e) { return err((e as Error).message); }
}
