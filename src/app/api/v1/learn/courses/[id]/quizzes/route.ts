import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { getQuizzesByCourse, createQuiz } from '@/lib/services/quiz.service';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return ok(await getQuizzesByCourse(params.id));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try {
    const body = await req.json();
    return ok(await createQuiz(params.id, body));
  } catch (e) { return err((e as Error).message); }
}
