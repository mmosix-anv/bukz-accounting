import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, unauthorized } from '@/lib/route-handler';
import { updateQuestion, deleteQuestion, replaceOptions } from '@/lib/services/quiz.service';

export async function PATCH(req: NextRequest, { params }: { params: { questionId: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try {
    const body = await req.json();
    if (body.options) {
      await replaceOptions(params.questionId, body.options);
      delete body.options;
    }
    if (Object.keys(body).length > 0) {
      return ok(await updateQuestion(params.questionId, body));
    }
    return ok({ updated: true });
  } catch (e) { return err((e as Error).message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { questionId: string } }) {
  const user = await getAuthUser(req);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) return unauthorized();
  try { return ok(await deleteQuestion(params.questionId)); }
  catch (e) { return err((e as Error).message); }
}
