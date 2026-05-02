import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { findEnrollmentsByUser } from '@/lib/services/enrollments.service';
import { findCertificatesByUser } from '@/lib/services/certificates.service';
import { getCpdSummary } from '@/lib/services/cpd.service';
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
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user) redirect('/auth/login?redirectTo=/dashboard/learn');
  const token = session?.access_token;

  const [rawEnrolls, rawCerts, cpdSummary] = await Promise.all([
    findEnrollmentsByUser(user.id).catch(() => []),
    findCertificatesByUser(user.id).catch(() => []),
    getCpdSummary(user.id).catch(() => null),
  ]);

  const enrollments: Enrollment[] = rawEnrolls.map((e) => ({
    id: e.id, courseId: e.courseId, progressPercent: e.progressPercent,
    completedAt: e.completedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString(),
    courseTitle: e.courseTitle, courseSlug: e.courseSlug, thumbnailUrl: e.thumbnailUrl,
    cpdHours: e.cpdHours, priceGbp: e.priceGbp, level: e.level, ratingAvg: e.ratingAvg,
  }));

  const certificates: Certificate[] = rawCerts.map((c) => ({
    id: c.id, issuedAt: c.issuedAt.toISOString(), courseTitle: c.courseTitle,
    courseSlug: c.courseSlug, cpdHours: c.cpdHours, certificateUrl: c.certificateUrl,
  }));

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
