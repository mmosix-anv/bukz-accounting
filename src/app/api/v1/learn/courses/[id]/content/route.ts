import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, notFound } from '@/lib/route-handler';
import { findCourseWithContent } from '@/lib/services/courses.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const course = await findCourseWithContent(params.id);
    const isAdmin = user.role === 'admin';
    if (!isAdmin && course.instructorId !== user.id) return forbidden();
    return ok(course);
  } catch {
    return notFound('Course');
  }
}
