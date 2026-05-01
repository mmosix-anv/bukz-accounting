import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { updateLesson } from '@/lib/services/courses.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; sectionId: string; lessonId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof updateLesson>[2];
    return ok(await updateLesson(params.lessonId, user.id, body));
  } catch (e) { return err((e as Error).message); }
}
