import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { getQuizWithQuestions, updateQuiz, deleteQuiz, publishQuiz } from '@/lib/services/quiz.service';

export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  const isAdmin = user?.user_metadata?.['role'] === 'admin' || user?.user_metadata?.['role'] === 'instructor';
  try { return ok(await getQuizWithQuestions(params.quizId, isAdmin)); }
  catch (e) { return err((e as Error).message, 404); }
}

export async function PATCH(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try {
    const body = await req.json();
    return ok(await updateQuiz(params.quizId, body));
  } catch (e) { return err((e as Error).message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { quizId: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try { return ok(await deleteQuiz(params.quizId)); }
  catch (e) { return err((e as Error).message); }
}
