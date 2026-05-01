import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { updateSection } from '@/lib/services/courses.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; sectionId: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as { title?: string; position?: number };
    return ok(await updateSection(params.sectionId, user.id, body));
  } catch (e) { return err((e as Error).message); }
}
