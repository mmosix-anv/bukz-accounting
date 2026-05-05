'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Progress,
  Radio,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { CheckCircle, XCircle, ArrowRight, Clock, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Option {
  id: string;
  optionText: string;
  position: number;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  position: number;
  explanation?: string | null;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  questions: Question[];
}

interface AttemptResult {
  id: string;
  score: number | null;
  totalPoints: number | null;
  passed: boolean | null;
  startedAt: string;
  completedAt: string | null;
}

interface Props {
  quiz: Quiz;
  courseSlug: string;
  token: string | undefined;
  previousAttempts: AttemptResult[];
}

export function QuizPlayerClient({ quiz, courseSlug, token, previousAttempts }: Props) {
  const [state, setState] = useState<'intro' | 'taking' | 'results'>('intro');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);

  const canAttempt = !quiz.maxAttempts || previousAttempts.length < quiz.maxAttempts;

  const handleStart = useCallback(async () => {
    setLoading(true);
    const attempt = await apiFetch<{ id: string }>(`/learn/quizzes/${quiz.id}/attempt`, { method: 'POST', token }).catch(() => null);
    setLoading(false);
    if (attempt) {
      setAttemptId(attempt.id);
      setAnswers({});
      setCurrentQ(0);
      setState('taking');
    }
  }, [quiz.id, token]);

  const selectOption = useCallback((questionId: string, optionId: string, questionType: string) => {
    setAnswers((prev) => {
      if (questionType === 'multi_select') {
        const current = prev[questionId] ?? [];
        return { ...prev, [questionId]: current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    const formatted = quiz.questions.map((q) => ({ questionId: q.id, selectedOptionIds: answers[q.id] ?? [] }));
    const res = await apiFetch<AttemptResult>(`/learn/quizzes/${quiz.id}/attempt/${attemptId}/submit`, {
      method: 'POST',
      token,
      body: JSON.stringify({ answers: formatted }),
    }).catch(() => null);
    setLoading(false);
    if (res) {
      setResult(res);
      setState('results');
    }
  }, [attemptId, quiz, answers, token]);

  if (state === 'intro') {
    const bestAttempt = previousAttempts.filter((a) => a.passed).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href={`/learn/${courseSlug}`} className="text-sm text-slate-500 hover:text-[#0f2a2e]">← Back to course</Link>
        <Card withBorder radius="xl" p="xl" mt="md" className="shadow-soft">
          <Stack gap="lg">
            <div>
              <Title order={2} c="primary.7">{quiz.title}</Title>
              {quiz.description && <Text size="sm" c="dimmed" mt="xs">{quiz.description}</Text>}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Text size="xl" fw={800} c="primary.7">{quiz.questions.length}</Text>
                <Text size="xs" c="dimmed">Questions</Text>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Text size="xl" fw={800} c="primary.7">{quiz.passingScore}%</Text>
                <Text size="xs" c="dimmed">Pass mark</Text>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Text size="xl" fw={800} c="primary.7">{quiz.timeLimitMinutes ?? '∞'}</Text>
                <Text size="xs" c="dimmed">Minutes</Text>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Text size="xl" fw={800} c="primary.7">{quiz.maxAttempts ?? '∞'}</Text>
                <Text size="xs" c="dimmed">Attempts</Text>
              </div>
            </div>

            {previousAttempts.length > 0 && (
              <div>
                <Text size="sm" fw={600} mb="xs">Previous Attempts ({previousAttempts.length})</Text>
                <Stack gap="xs">
                  {previousAttempts.slice(0, 5).map((a) => (
                    <Group key={a.id} justify="space-between" className="rounded-lg bg-slate-50 px-4 py-2">
                      <Group gap="sm">
                        {a.passed ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-400" />}
                        <Text size="sm">{a.score}/{a.totalPoints} ({a.totalPoints ? Math.round(((a.score ?? 0) / a.totalPoints) * 100) : 0}%)</Text>
                      </Group>
                      <Badge color={a.passed ? 'green' : 'red'} variant="light" size="sm">{a.passed ? 'Passed' : 'Failed'}</Badge>
                    </Group>
                  ))}
                </Stack>
              </div>
            )}

            {bestAttempt ? (
              <Alert color="green" icon={<CheckCircle size={16} />}>You have already passed this quiz.</Alert>
            ) : !canAttempt ? (
              <Alert color="red" icon={<XCircle size={16} />}>You have used all available attempts.</Alert>
            ) : null}

            <Button size="lg" onClick={() => void handleStart()} loading={loading} disabled={!canAttempt}>
              {previousAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
          </Stack>
        </Card>
      </div>
    );
  }

  if (state === 'taking') {
    const q = quiz.questions[currentQ]!;
    const selected = answers[q.id] ?? [];
    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
    const answeredCount = Object.keys(answers).filter((k) => (answers[k]?.length ?? 0) > 0).length;

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="dimmed">Question {currentQ + 1} of {quiz.questions.length}</Text>
          <Group gap="xs">
            {quiz.timeLimitMinutes && (
              <Badge variant="light" color="gray" leftSection={<Clock size={10} />}>{quiz.timeLimitMinutes} min limit</Badge>
            )}
            <Text size="sm" fw={600} c="primary.7">{answeredCount}/{quiz.questions.length} answered</Text>
          </Group>
        </Group>
        <Progress value={(currentQ / quiz.questions.length) * 100} size="sm" radius="xl" color="accent" mb="lg" />

        <Card withBorder radius="xl" p="xl" className="shadow-soft">
          <Stack gap="lg">
            <div>
              <Group gap="xs" mb="xs">
                <Badge size="xs" variant="light" color="primary">{q.points} pt{q.points > 1 ? 's' : ''}</Badge>
                <Badge size="xs" variant="light" color="gray">{q.questionType.replace('_', ' ')}</Badge>
              </Group>
              <Title order={3} size="h4" c="primary.7">{q.questionText}</Title>
            </div>

            <Stack gap="sm">
              {q.questionType === 'multi_select' ? (
                q.options.map((o) => (
                  <Checkbox
                    key={o.id}
                    label={o.optionText}
                    checked={selected.includes(o.id)}
                    onChange={() => selectOption(q.id, o.id, q.questionType)}
                    styles={{ body: { cursor: 'pointer' } }}
                  />
                ))
              ) : (
                <Radio.Group value={selected[0] ?? ''} onChange={(v) => selectOption(q.id, v, q.questionType)}>
                  <Stack gap="sm">
                    {q.options.map((o) => (
                      <Radio key={o.id} value={o.id} label={o.optionText} styles={{ body: { cursor: 'pointer' } }} />
                    ))}
                  </Stack>
                </Radio.Group>
              )}
            </Stack>

            <Group justify="space-between" mt="md">
              <Button variant="default" disabled={currentQ === 0} onClick={() => setCurrentQ((p) => p - 1)}>Previous</Button>
              {currentQ < quiz.questions.length - 1 ? (
                <Button rightSection={<ArrowRight size={14} />} onClick={() => setCurrentQ((p) => p + 1)}>Next</Button>
              ) : (
                <Button color="green" onClick={() => void handleSubmit()} loading={loading} disabled={answeredCount < quiz.questions.length}>
                  Submit Quiz
                </Button>
              )}
            </Group>
          </Stack>
        </Card>

        <Group gap="xs" mt="md" justify="center" wrap="wrap">
          {quiz.questions.map((q, i) => {
            const hasAnswer = (answers[q.id]?.length ?? 0) > 0;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  i === currentQ
                    ? 'bg-[#0f2a2e] text-white'
                    : hasAnswer
                      ? 'bg-[#2cd7f2]/20 text-[#0f2a2e]'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </Group>
      </div>
    );
  }

  const scorePercent = result && result.totalPoints ? Math.round(((result.score ?? 0) / result.totalPoints) * 100) : 0;
  const passed = result?.passed;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card withBorder radius="xl" p="xl" className="shadow-soft text-center">
        <Stack gap="lg" align="center">
          <ThemeIcon size={80} radius="xl" variant="light" color={passed ? 'green' : 'red'}>
            {passed ? <CheckCircle size={40} /> : <XCircle size={40} />}
          </ThemeIcon>

          <div>
            <Title order={2} c={passed ? 'green.7' : 'red.7'}>{passed ? 'Quiz Passed!' : 'Quiz Not Passed'}</Title>
            <Text size="sm" c="dimmed" mt="xs">{quiz.title}</Text>
          </div>

          <div className="w-full max-w-xs">
            <Text size="3rem" fw={900} c="primary.7" lh={1}>{scorePercent}%</Text>
            <Progress value={scorePercent} color={passed ? 'green' : 'red'} size="lg" radius="xl" mt="md" />
            <Text size="sm" c="dimmed" mt="xs">{result?.score}/{result?.totalPoints} points · Pass mark: {quiz.passingScore}%</Text>
          </div>

          <Group gap="md">
            {canAttempt && !passed && (
              <Button leftSection={<RotateCcw size={14} />} onClick={() => { setState('intro'); setResult(null); }}>
                Try Again
              </Button>
            )}
            <Button component={Link} href={`/learn/${courseSlug}`} variant="default">
              Back to Course
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
