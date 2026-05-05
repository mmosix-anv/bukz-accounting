import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getQuizWithQuestions, getUserAttempts } from '@/lib/services/quiz.service';
import { QuizPlayerClient } from './quiz-player-client';

export const metadata: Metadata = { title: 'Quiz | BUKZ Learn' };

export default async function QuizPage({ params }: { params: Promise<{ slug: string; quizId: string }> }) {
  const { slug, quizId } = await params;
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user) redirect(`/auth/login?redirectTo=/learn/${slug}/quiz/${quizId}`);

  const quiz = await getQuizWithQuestions(quizId, false).catch(() => null);
  if (!quiz || !quiz.isPublished) notFound();

  const previousAttempts = await getUserAttempts(user.id, quizId);
  const serialisedAttempts = previousAttempts.map((a) => ({
    id: a.id,
    score: a.score,
    totalPoints: a.totalPoints,
    passed: a.passed,
    startedAt: a.startedAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
  }));

  return (
    <QuizPlayerClient
      quiz={quiz}
      courseSlug={slug}
      token={session?.access_token}
      previousAttempts={serialisedAttempts}
    />
  );
}
