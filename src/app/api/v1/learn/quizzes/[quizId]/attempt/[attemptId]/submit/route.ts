import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { submitAttempt } from '@/lib/services/quiz.service';

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { answers } = await req.json() as { answers: { questionId: string; selectedOptionIds: string[] }[] };
    return ok(await submitAttempt(params.attemptId, user.id, answers));
  } catch (e) { return err((e as Error).message); }
}
