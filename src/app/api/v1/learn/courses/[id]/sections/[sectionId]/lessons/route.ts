import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createLesson } from '@/lib/services/courses.service';

export async function POST(req: NextRequest, { params }: { params: { id: string; sectionId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof createLesson>[2];
    return ok(await createLesson(params.sectionId, user.id, body), 201);
  } catch (e) { return err((e as Error).message); }
}
