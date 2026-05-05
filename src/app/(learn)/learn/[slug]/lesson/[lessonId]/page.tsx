import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLessonContent, getCourseSyllabus } from '@/lib/services/courses.service';
import { getCourseProgress } from '@/lib/services/progress.service';
import { LessonPlayerClient } from './lesson-player-client';

interface Props {
  params: Promise<{ slug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  try {
    const lesson = await getLessonContent(null, lessonId);
    return { title: `${lesson.title} | ${lesson.courseTitle} | BUKZ Learn` };
  } catch {
    return { title: 'Lesson | BUKZ Learn' };
  }
}

export default async function LessonPlayerPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const lesson = await getLessonContent(user?.id ?? null, lessonId).catch(() => null);
  if (!lesson) notFound();

  if (lesson.courseSlug !== slug) {
    redirect(`/learn/${lesson.courseSlug}/lesson/${lessonId}`);
  }

  const isEnrolled = !!user && !lesson.isFree;
  const [syllabus, progress] = await Promise.all([
    getCourseSyllabus(lesson.courseId, user?.id ?? null),
    user ? getCourseProgress(user.id, lesson.courseId) : { enrolled: false, progressPercent: 0, completedLessons: [] as string[] },
  ]);

  const allLessons = syllabus.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1]!.id : null;
  const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1]!.id : null;

  const enrolled = 'enrolled' in progress ? progress.enrolled : false;

  const serialisedLesson = {
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    durationMinutes: lesson.durationMinutes,
    isFree: lesson.isFree,
    courseId: lesson.courseId,
    courseTitle: lesson.courseTitle,
    courseSlug: lesson.courseSlug,
    sectionTitle: lesson.sectionTitle,
  };

  return (
    <LessonPlayerClient
      lesson={serialisedLesson}
      syllabus={syllabus}
      isEnrolled={enrolled}
      progressPercent={progress.progressPercent}
      token={session?.access_token}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
    />
  );
}
