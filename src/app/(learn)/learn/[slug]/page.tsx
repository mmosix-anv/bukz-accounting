import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { findCourseBySlug } from '@/lib/services/courses.service';
import { CourseDetailClient } from './course-detail-client';

const getCourse = cache(findCourseBySlug);

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const course = await getCourse(params.slug);
    return {
      title: `${course.title} | BUKZ Learn`,
      description: course.shortDescription ?? undefined,
    };
  } catch {
    return { title: 'Course not found | BUKZ' };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let raw: Awaited<ReturnType<typeof getCourse>>;
  try {
    raw = await getCourse(params.slug, user?.id);
  } catch {
    notFound();
  }

  if (raw.status !== 'published') notFound();

  const course = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? '',
    shortDescription: raw.shortDescription ?? '',
    thumbnailUrl: raw.thumbnailUrl,
    level: raw.level,
    priceGbp: raw.priceGbp,
    cpdHours: raw.cpdHours,
    status: raw.status,
    enrollmentsCount: raw.enrollmentsCount,
    ratingAvg: raw.ratingAvg,
    ratingCount: raw.ratingCount,
    isEnrolled: raw.isEnrolled,
    instructor: raw.instructor,
    sections: raw.sections.map((s) => ({
      id: s.id,
      title: s.title,
      position: s.position,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        durationMinutes: l.durationMinutes,
        isFree: l.isFree,
        position: l.position,
        content: l.content,
        videoUrl: l.videoUrl,
      })),
    })),
  };

  const price =
    Number(course.priceGbp) === 0
      ? 'Free'
      : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(
          Number(course.priceGbp),
        );

  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const totalMinutes = course.sections.reduce(
    (s, sec) => s + sec.lessons.reduce((ls, l) => ls + (l.durationMinutes ?? 0), 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
              CPD Accredited — {course.cpdHours} hours
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary capitalize">
              {course.level}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-primary leading-tight">{course.title}</h1>
          <p className="mt-2 text-lg text-slate-600">{course.shortDescription}</p>

          {course.instructor && (
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                {course.instructor.avatarUrl ? (
                  <Image src={course.instructor.avatarUrl} alt={course.instructor.name} width={36} height={36} />
                ) : (
                  course.instructor.name[0]
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{course.instructor.name}</p>
                <p className="text-xs text-slate-500">Course instructor</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {course.ratingAvg && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">{'★'.repeat(Math.round(Number(course.ratingAvg)))}</span>
                <span className="font-medium text-slate-700">{Number(course.ratingAvg).toFixed(1)}</span>
                <span>({course.ratingCount} reviews)</span>
              </span>
            )}
            <span>{course.enrollmentsCount.toLocaleString()} enrolled</span>
            <span>{totalLessons} lessons</span>
            <span>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total</span>
          </div>

          <CourseDetailClient
            course={course}
            userId={user?.id}
            isEnrolled={course.isEnrolled}
          />
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {course.thumbnailUrl && (
              <div className="relative h-44">
                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <p className="text-3xl font-bold text-primary">{price}</p>
              {Number(course.priceGbp) > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">One-time payment · GBP</p>
              )}

              {course.isEnrolled ? (
                <a
                  href={`/dashboard/learn/${course.id}`}
                  className="mt-4 block w-full rounded-md bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Go to course →
                </a>
              ) : user ? (
                <a
                  href={`/api/checkout/course?courseId=${course.id}`}
                  className="mt-4 block w-full rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-white hover:bg-accent/90 transition-colors"
                >
                  {Number(course.priceGbp) === 0 ? 'Enrol free' : `Enrol — ${price}`}
                </a>
              ) : (
                <a
                  href={`/auth/register?redirectTo=/learn/${course.slug}`}
                  className="mt-4 block w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  Create account to enrol
                </a>
              )}

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                {[
                  ['Level', course.level.charAt(0).toUpperCase() + course.level.slice(1)],
                  ['CPD hours', `${course.cpdHours} hours`],
                  ['Lessons', String(totalLessons)],
                  ['Certificate', 'Yes — PDF on completion'],
                  ['Access', 'Lifetime'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
