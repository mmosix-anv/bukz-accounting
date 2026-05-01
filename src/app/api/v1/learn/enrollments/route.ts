import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findEnrollmentsByUser, enrolInCourse } from '@/lib/services/enrollments.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await findEnrollmentsByUser(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { courseId, stripePaymentIntentId } = await req.json() as { courseId: string; stripePaymentIntentId?: string };
    return ok(await enrolInCourse(user.id, courseId, stripePaymentIntentId), 201);
  } catch (e) { return err((e as Error).message); }
}
