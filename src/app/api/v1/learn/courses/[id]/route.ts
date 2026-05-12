import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err, notFound, forbidden } from '@/lib/route-handler';
import { findCourseBySlug, findCourseById, updateCourse, deleteCourse } from '@/lib/services/courses.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  try {
    const course = await findCourseBySlug(params.id, user?.id);
    return ok(course);
  } catch { return notFound('Course'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof updateCourse>[2];
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    return ok(await updateCourse(params.id, user.id, body, isAdmin));
  } catch (e) { return err((e as Error).message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try {
    await deleteCourse(params.id);
    return ok({ deleted: true });
  } catch (e) { return err((e as Error).message, 404); }
}
