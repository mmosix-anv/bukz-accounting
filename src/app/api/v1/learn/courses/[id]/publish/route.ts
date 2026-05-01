import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { publishCourse } from '@/lib/services/courses.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await publishCourse(params.id, user.id)); }
  catch (e) { return err((e as Error).message); }
}
