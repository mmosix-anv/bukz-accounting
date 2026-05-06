import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findEnrollmentsByUser, enrolInCourse } from '@/lib/services/enrollments.service';

const enrolmentRequestSchema = z.object({
  courseId: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await findEnrollmentsByUser(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { courseId } = enrolmentRequestSchema.parse(await req.json());
    return ok(await enrolInCourse(user.id, courseId), 201);
  } catch (e) {
    if (e instanceof z.ZodError) return err('Invalid enrolment request');
    return err((e as Error).message);
  }
}
