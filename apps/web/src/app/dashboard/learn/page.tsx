import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/api';
import { LearnDashboardClient } from './learn-dashboard-client';
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export const metadata: Metadata = { title: 'My Learning | BUKZ Learn' };

interface Enrollment {
  id: string;
  courseId: string;
  progressPercent: number;
  completedAt: string | null;
  createdAt: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
  cpdHours: string;
  priceGbp: string;
  level: string;
  ratingAvg: string | null;
}

interface Certificate {
  id: string;
  issuedAt: string;
  courseTitle: string;
  courseSlug: string;
  cpdHours: string;
  certificateUrl: string | null;
}

interface CpdSummary {
  year: number;
  totalHours: number;
  monthlyData: { month: string; hours: number }[];
  requirements: {
    body: string;
    required: number;
    completed: number;
    remaining: number;
    percentage: number;
    met: boolean;
  }[];
}

export default async function LearnDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/dashboard/learn');

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const [enrollments, certificates, cpdSummary] = await Promise.all([
    apiFetch<Enrollment[]>('/learn/enrollments/my', { token }).catch(() => []),
    apiFetch<Certificate[]>('/learn/certificates/my', { token }).catch(() => []),
    apiFetch<CpdSummary>('/learn/cpd/my/summary', { token }).catch(() => null),
  ]);

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Stack gap={2}>
          <Title order={1} size="h2">
            My Learning
          </Title>
          <Text c="dimmed">Track your progress and CPD hours</Text>
        </Stack>
        <Button
          component={Link}
          href="/learn"
          variant="outline"
        >
          Browse courses
        </Button>
      </Group>

      <LearnDashboardClient
        enrollments={enrollments}
        certificates={certificates}
        cpdSummary={cpdSummary}
        token={token}
      />
    </Container>
  );
}
