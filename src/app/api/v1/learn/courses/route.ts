import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findAllCourses, createCourse, getCourseCategories } from '@/lib/services/courses.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('categories') === 'true') return ok(await getCourseCategories());
  return ok(await findAllCourses({
    level: searchParams.getAll('level'),
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    cpdHoursMin: searchParams.get('cpdHoursMin') ? Number(searchParams.get('cpdHoursMin')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'newest' | 'rating' | 'enrollments') ?? 'newest',
    limit: Number(searchParams.get('limit') ?? 20),
    offset: Number(searchParams.get('offset') ?? 0),
  }));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof createCourse>[1];
    return ok(await createCourse(user.id, body), 201);
  } catch (e) { return err((e as Error).message); }
}
