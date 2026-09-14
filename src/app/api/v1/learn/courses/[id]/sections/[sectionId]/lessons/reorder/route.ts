import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { reorderLessons } from '@/lib/services/courses.service';

export async function POST(req: NextRequest, { params }: { params: { sectionId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as { orderedIds: string[] };
    await reorderLessons(params.sectionId, user.id, body.orderedIds);
    return ok({ reordered: true });
  } catch (e) { return err((e as Error).message); }
}
