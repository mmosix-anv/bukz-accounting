'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  Box,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Badge,
  Alert,
} from '@mantine/core';
import { Check, ChevronLeft, ChevronRight, Lock, Play, CheckCircle, BookOpen } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  isFree: boolean;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  sectionTitle: string;
}

interface SyllabusLesson {
  id: string;
  title: string;
  durationMinutes: number | null;
  isFree: boolean;
  completed: boolean;
}

interface SyllabusSection {
  id: string;
  title: string;
  lessons: SyllabusLesson[];
}

interface Props {
  lesson: Lesson;
  syllabus: SyllabusSection[];
  isEnrolled: boolean;
  progressPercent: number;
  token: string | undefined;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export function LessonPlayerClient({ lesson, syllabus, isEnrolled, progressPercent, token, prevLessonId, nextLessonId }: Props) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(
    syllabus.flatMap((s) => s.lessons).find((l) => l.id === lesson.id)?.completed ?? false,
  );
  const [progress, setProgress] = useState(progressPercent);

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    const result = await apiFetch<{ progressPercent: number }>(`/learn/lessons/${lesson.id}/complete`, {
      method: 'POST',
      token,
    }).catch(() => null);
    setCompleting(false);
    if (result) {
      setCompleted(true);
      setProgress(result.progressPercent);
      if (result.progressPercent === 100) {
        router.push(`/learn/${lesson.courseSlug}/complete`);
        return;
      }
    }
    if (nextLessonId) {
      router.push(`/learn/${lesson.courseSlug}/lesson/${nextLessonId}`);
    }
  }, [lesson.id, lesson.courseSlug, nextLessonId, token, router]);

  const allLessons = syllabus.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => l.completed || l.id === lesson.id && completed).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href={`/learn/${lesson.courseSlug}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0f2a2e]">
            <ChevronLeft size={16} />
            Back to course
          </Link>
          <div className="flex-1 min-w-0">
            <Text size="sm" fw={600} c="primary.7" truncate>{lesson.courseTitle}</Text>
          </div>
          <Group gap="xs" wrap="nowrap" visibleFrom="sm">
            <Text size="xs" c="dimmed">{completedCount}/{totalLessons} lessons</Text>
            <Progress value={progress} size="sm" radius="xl" color="accent" w={120} />
            <Text size="xs" fw={600} c="accent">{progress}%</Text>
          </Group>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <Card withBorder radius="xl" p={0} className="overflow-hidden shadow-soft">
              {lesson.videoUrl && (
                <div className="relative aspect-video bg-black">
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="h-full w-full"
                    poster=""
                  />
                </div>
              )}

              <div className="p-8">
                <Group gap="sm" mb="xs">
                  <Badge color="primary" variant="light" size="sm">{lesson.sectionTitle}</Badge>
                  {lesson.durationMinutes && (
                    <Badge color="gray" variant="light" size="sm">{lesson.durationMinutes} min</Badge>
                  )}
                  {completed && (
                    <Badge color="green" variant="light" size="sm" leftSection={<Check size={10} />}>Completed</Badge>
                  )}
                </Group>

                <Title order={1} size="h2" c="primary.7" mt="sm">{lesson.title}</Title>

                {lesson.content && (
                  <Box mt="lg" className="prose prose-slate max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </Box>
                )}

                {!lesson.content && !lesson.videoUrl && (
                  <Alert color="gray" mt="lg">
                    No content has been added to this lesson yet.
                  </Alert>
                )}
              </div>
            </Card>

            {isEnrolled && (
              <Group justify="space-between" mt="lg">
                {prevLessonId ? (
                  <Button
                    component={Link}
                    href={`/learn/${lesson.courseSlug}/lesson/${prevLessonId}`}
                    variant="default"
                    leftSection={<ChevronLeft size={16} />}
                  >
                    Previous
                  </Button>
                ) : <div />}

                {!completed ? (
                  <Button
                    onClick={() => void handleComplete()}
                    loading={completing}
                    rightSection={nextLessonId ? <ChevronRight size={16} /> : <CheckCircle size={16} />}
                  >
                    {nextLessonId ? 'Complete & Next' : 'Complete Course'}
                  </Button>
                ) : nextLessonId ? (
                  <Button
                    component={Link}
                    href={`/learn/${lesson.courseSlug}/lesson/${nextLessonId}`}
                    rightSection={<ChevronRight size={16} />}
                  >
                    Next Lesson
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    href={`/learn/${lesson.courseSlug}/complete`}
                    rightSection={<CheckCircle size={16} />}
                    color="green"
                  >
                    View Certificate
                  </Button>
                )}
              </Group>
            )}
          </main>

          <aside className="hidden w-80 shrink-0 lg:block">
            <Card withBorder radius="xl" p="md" className="sticky top-20 shadow-soft">
              <Group gap="sm" mb="md">
                <ThemeIcon size={28} radius="xl" variant="light" color="primary">
                  <BookOpen size={14} />
                </ThemeIcon>
                <Text size="sm" fw={700} c="primary.7">Course Outline</Text>
              </Group>
              <Accordion
                multiple
                defaultValue={syllabus.map((s) => s.id)}
                variant="contained"
                styles={{ item: { borderBottom: 'none' }, control: { padding: '8px 12px' }, content: { padding: '0' } }}
              >
                {syllabus.map((section) => (
                  <Accordion.Item key={section.id} value={section.id}>
                    <Accordion.Control>
                      <Text size="xs" fw={700} c="primary.7">{section.title}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap={0}>
                        {section.lessons.map((l) => {
                          const isCurrent = l.id === lesson.id;
                          const isComplete = l.completed || (l.id === lesson.id && completed);
                          const isAccessible = isEnrolled || l.isFree;

                          return (
                            <Link
                              key={l.id}
                              href={isAccessible ? `/learn/${lesson.courseSlug}/lesson/${l.id}` : '#'}
                              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                isCurrent
                                  ? 'bg-[#0f2a2e] text-white rounded-lg'
                                  : isAccessible
                                    ? 'text-slate-600 hover:bg-slate-50'
                                    : 'text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="shrink-0">
                                {isComplete ? (
                                  <Check size={14} className={isCurrent ? 'text-emerald-300' : 'text-emerald-500'} />
                                ) : isAccessible ? (
                                  <Play size={14} className={isCurrent ? 'text-[#2cd7f2]' : ''} />
                                ) : (
                                  <Lock size={12} />
                                )}
                              </div>
                              <span className="truncate flex-1">{l.title}</span>
                              {l.durationMinutes && (
                                <span className={`shrink-0 text-xs ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {l.durationMinutes}m
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
