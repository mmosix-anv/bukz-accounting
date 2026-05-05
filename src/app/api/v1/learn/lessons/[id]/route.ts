import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err } from '@/lib/route-handler';
import { getLessonContent } from '@/lib/services/courses.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  try { return ok(await getLessonContent(user?.id ?? null, params.id)); }
  catch (e) { return err((e as Error).message, 403); }
}
