import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import { enrolInCourse } from '@/lib/services/enrollments.service';
import { createCourseCheckout } from '@/lib/services/payments.service';
import { db } from '@/lib/db';
import { courses } from '@bukz/db';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId');
  if (!courseId) {
    return NextResponse.redirect(new URL('/learn', req.url));
  }

  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.redirect(new URL(`/auth/login?redirectTo=/learn`, req.url));
  }

  const [course] = await db.select({ id: courses.id, priceGbp: courses.priceGbp, slug: courses.slug, status: courses.status })
    .from(courses).where(eq(courses.id, courseId)).limit(1);

  if (!course || course.status !== 'published') {
    return NextResponse.redirect(new URL('/learn', req.url));
  }

  if (Number(course.priceGbp) === 0) {
    try {
      await enrolInCourse(user.id, courseId);
      return NextResponse.redirect(new URL(`/dashboard/learn?enrolled=${courseId}`, req.url));
    } catch {
      return NextResponse.redirect(new URL(`/learn/${course.slug}?error=enrollment_failed`, req.url));
    }
  }

  try {
    const checkoutSession = await createCourseCheckout(user.id, courseId, user.email ?? undefined);
    if (checkoutSession.url) {
      return NextResponse.redirect(checkoutSession.url);
    }
    return NextResponse.redirect(new URL(`/learn/${course.slug}?error=checkout_failed`, req.url));
  } catch {
    return NextResponse.redirect(new URL(`/learn/${course.slug}?error=checkout_failed`, req.url));
  }
}
