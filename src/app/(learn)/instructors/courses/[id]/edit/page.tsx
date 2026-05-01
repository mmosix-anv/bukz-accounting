import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/api';
import { LessonBuilder } from './lesson-builder';

export const metadata: Metadata = { title: 'Edit Course | BUKZ Instructor' };

interface Props {
  params: { id: string };
}

export default async function EditCoursePage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const role = user.user_metadata?.['role'];
  if (role !== 'instructor' && role !== 'admin') redirect('/dashboard');

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const courses = await apiFetch<{ id: string; title: string; slug: string }[]>(
    '/learn/courses/instructor/my', { token }
  ).catch(() => []);

  const course = courses.find((c) => c.id === params.id);
  if (!course) redirect('/instructors/dashboard');

  const fullCourse = await apiFetch<{
    id: string;
    title: string;
    slug: string;
    sections: {
      id: string;
      title: string;
      position: number;
      lessons: {
        id: string;
        title: string;
        content: string | null;
        videoUrl: string | null;
        durationMinutes: number | null;
        isFree: boolean;
        position: number;
      }[];
    }[];
  }>(`/learn/courses/${course.slug}`, { token }).catch(() => null);

  if (!fullCourse) redirect('/instructors/dashboard');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <a href="/instructors/dashboard" className="text-sm text-slate-500 hover:text-primary">
          ← Back to dashboard
        </a>
        <h1 className="mt-2 text-2xl font-bold text-primary">{fullCourse.title}</h1>
        <p className="mt-1 text-slate-500">Build your course curriculum</p>
      </div>
      <LessonBuilder course={fullCourse} token={token} />
    </div>
  );
}
