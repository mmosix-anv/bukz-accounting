import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { markLessonComplete } from '@/lib/services/progress.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await markLessonComplete(user.id, params.id)); }
  catch (e) { return err((e as Error).message); }
}
