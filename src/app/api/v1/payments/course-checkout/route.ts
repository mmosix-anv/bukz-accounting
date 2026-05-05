import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createCourseCheckout } from '@/lib/services/payments.service';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { courseId } = await req.json() as { courseId: string };
    const session = await createCourseCheckout(user.id, courseId, user.email);
    return ok({ url: session.url });
  } catch (e) { return err((e as Error).message); }
}
