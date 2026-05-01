import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createSection } from '@/lib/services/courses.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { title } = await req.json() as { title: string };
    return ok(await createSection(params.id, user.id, title), 201);
  } catch (e) { return err((e as Error).message); }
}
