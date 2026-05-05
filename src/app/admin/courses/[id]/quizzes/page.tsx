import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { findCourseById } from '@/lib/services/courses.service';
import { getQuizzesByCourse, getQuizWithQuestions } from '@/lib/services/quiz.service';
import { QuizManagerClient } from './quiz-manager-client';

export const metadata: Metadata = { title: 'Manage Quizzes | Admin' };

export default async function AdminQuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user || !['admin', 'instructor'].includes(user.user_metadata?.['role'])) redirect('/dashboard');

  const course = await findCourseById(id).catch(() => null);
  if (!course) notFound();

  const rawQuizzes = await getQuizzesByCourse(id);
  const quizzes = await Promise.all(
    rawQuizzes.map((q) => getQuizWithQuestions(q.id, true)),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/courses/${id}/sections`} className="text-sm text-slate-500 hover:text-[#0f2a2e]">
          ← Back to Course Content
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#0f2a2e]">Quizzes — {course.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</p>
      </div>
      <QuizManagerClient courseId={id} quizzes={quizzes as Parameters<typeof QuizManagerClient>[0]['quizzes']} token={session?.access_token} />
    </div>
  );
}
