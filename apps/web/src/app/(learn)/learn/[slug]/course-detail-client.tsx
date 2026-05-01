'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Rating,
  Stack,
  Tabs,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Check, Lock, Play, UserRound } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

interface Lesson {
  id: string;
  title: string;
  durationMinutes: number | null;
  isFree: boolean;
  position: number;
  content: string | null;
  videoUrl: string | null;
}

interface Section {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  description: string;
  sections: Section[];
  instructor: { name: string; avatarUrl: string | null } | null;
}

interface Review {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  reviewerName: string;
}

interface Props {
  course: Course;
  userId?: string;
  isEnrolled: boolean;
}

function WriteReviewForm({ courseId }: { courseId: string }) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    await apiFetch('/learn/reviews', {
      method: 'POST',
      token,
      body: JSON.stringify({ courseId, rating, body: body || null }),
    }).catch(() => null);
    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return (
      <Alert color="green" variant="light">
        Thank you for your review.
      </Alert>
    );
  }

  return (
    <Card component="form" onSubmit={(event) => void submit(event)} withBorder radius="md" p="lg" bg="gray.0">
      <Stack gap="md">
        <Title order={3} size="h4">
          Leave a review
        </Title>
        <Rating value={rating} onChange={setRating} size="lg" />
        <Textarea
          minRows={3}
          value={body}
          onChange={(event) => setBody(event.currentTarget.value)}
          placeholder="Share your experience (optional)"
        />
        <Button type="submit" loading={saving} disabled={rating === 0} w="fit-content">
          Submit review
        </Button>
      </Stack>
    </Card>
  );
}

function LessonRow({ lesson, isEnrolled, completedIds }: { lesson: Lesson; isEnrolled: boolean; completedIds: string[] }) {
  const isAccessible = isEnrolled || lesson.isFree;
  const isComplete = completedIds.includes(lesson.id);

  const icon = isComplete ? <Check size={14} /> : isAccessible ? <Play size={14} /> : <Lock size={14} />;

  return (
    <Group px="md" py="sm" wrap="nowrap" bg={isComplete ? 'green.0' : undefined}>
      <ThemeIcon size={26} radius="xl" variant="light" color={isComplete ? 'green' : isAccessible ? 'primary' : 'gray'}>
        {icon}
      </ThemeIcon>
      <Box flex={1} miw={0}>
        <Text size="sm" c={isAccessible ? 'primary.8' : 'dimmed'} truncate>
          {lesson.title}
        </Text>
        {lesson.isFree && !isEnrolled && (
          <Badge size="xs" color="green" variant="light">
            Free preview
          </Badge>
        )}
      </Box>
      {lesson.durationMinutes && (
        <Text size="xs" c="dimmed">
          {lesson.durationMinutes}m
        </Text>
      )}
    </Group>
  );
}

export function CourseDetailClient({ course, userId, isEnrolled }: Props) {
  const { data: progress } = useQuery({
    queryKey: ['course-progress', course.id],
    queryFn: async () => {
      if (!userId || !isEnrolled) return { completedLessons: [] };
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return { completedLessons: [] };
      return apiFetch<{ completedLessons: string[] }>(`/learn/progress/course/${course.id}`, { token });
    },
    enabled: !!userId && isEnrolled,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', course.id],
    queryFn: () => apiFetch<Review[]>(`/learn/reviews/course/${course.id}`),
  });

  const completedIds = progress?.completedLessons ?? [];

  return (
    <Tabs defaultValue="overview" mt="xl" variant="outline" radius="md">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="curriculum">Curriculum</Tabs.Tab>
        <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
        <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview" pt="lg">
        <Text size="sm" lh={1.8} c="gray.7">
          {course.description}
        </Text>
      </Tabs.Panel>

      <Tabs.Panel value="curriculum" pt="lg">
        <Accordion multiple defaultValue={course.sections[0]?.id ? [course.sections[0].id] : []} variant="contained">
          {course.sections.map((section) => (
            <Accordion.Item key={section.id} value={section.id}>
              <Accordion.Control>
                <Group justify="space-between" pr="md">
                  <Text fw={700} c="primary.8">
                    {section.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {section.lessons.length} lessons
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel p={0}>
                <Stack gap={0}>
                  {section.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} isEnrolled={isEnrolled} completedIds={completedIds} />
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Tabs.Panel>

      <Tabs.Panel value="instructor" pt="lg">
        {course.instructor && (
          <Group align="flex-start" gap="lg">
            <Avatar src={course.instructor.avatarUrl} size={64} radius="xl" color="primary">
              <UserRound size={28} />
            </Avatar>
            <Stack gap={6}>
              <Title order={3} size="h4">
                {course.instructor.name}
              </Title>
              <Text size="sm" c="dimmed">
                Expert accounting professional and educator specialising in CPD-accredited training for the UK finance
                sector.
              </Text>
            </Stack>
          </Group>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="reviews" pt="lg">
        <Stack gap="lg">
          {isEnrolled && <WriteReviewForm courseId={course.id} />}
          {reviews.length === 0 ? (
            <Text size="sm" c="dimmed">
              No reviews yet.{isEnrolled ? ' Be the first.' : ''}
            </Text>
          ) : (
            <Stack gap="md">
              {reviews.map((review) => (
                <Card key={review.id} withBorder radius="md" p="md">
                  <Group align="flex-start" wrap="nowrap">
                    <Avatar color="primary" radius="xl">
                      {review.reviewerName[0]}
                    </Avatar>
                    <Stack gap={4}>
                      <Text size="sm" fw={700} c="primary.8">
                        {review.reviewerName}
                      </Text>
                      <Group gap="xs">
                        <Rating value={review.rating} readOnly size="sm" />
                        <Text size="xs" c="dimmed">
                          {new Date(review.createdAt).toLocaleDateString('en-GB')}
                        </Text>
                      </Group>
                      {review.body && (
                        <Text size="sm" c="gray.7">
                          {review.body}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}
