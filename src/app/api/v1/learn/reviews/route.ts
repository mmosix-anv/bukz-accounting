import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { createReview, findReviewsByCourse } from '@/lib/services/reviews.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId') ?? '';
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = Number(searchParams.get('offset') ?? 0);
  return ok(await findReviewsByCourse(courseId, limit, offset));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { courseId, rating, body } = await req.json() as { courseId: string; rating: number; body?: string };
    return ok(await createReview(user.id, courseId, rating, body), 201);
  } catch (e) { return err((e as Error).message); }
}
