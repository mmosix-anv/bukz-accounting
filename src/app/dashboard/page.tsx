import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { findApplicationsByCandidate } from '@/lib/services/job-applications.service';
import { findEnrollmentsByUser } from '@/lib/services/enrollments.service';
import { SkillsGapButton } from './skills-gap-button';
import { Anchor, Badge, Box, Card, Group, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Dashboard | BUKZ' };

interface Application {
  id: string;
  status: string;
  createdAt: string;
  jobTitle: string;
  jobSlug: string;
  jobLocation: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
}

interface Enrollment {
  id: string;
  courseId: string;
  progressPercent: number;
  completedAt: string | null;
  createdAt: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  submitted: 'blue',
  viewed: 'gray',
  shortlisted: 'green',
  offered: 'accent',
  rejected: 'red',
};

export default async function DashboardPage() {
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user) redirect('/auth/login');
  const token = session?.access_token;

  const [rawApps, rawEnrolls] = await Promise.all([
    findApplicationsByCandidate(user.id).catch(() => []),
    findEnrollmentsByUser(user.id).catch(() => []),
  ]);

  const applications: Application[] = rawApps.map((a) => ({
    id: a.id, status: a.status, createdAt: a.createdAt.toISOString(),
    jobTitle: a.jobTitle, jobSlug: a.jobSlug, jobLocation: a.jobLocation,
    salaryMin: a.salaryMin, salaryMax: a.salaryMax, salaryCurrency: a.salaryCurrency,
  }));

  const enrollments: Enrollment[] = rawEnrolls.map((e) => ({
    id: e.id, courseId: e.courseId, progressPercent: e.progressPercent,
    completedAt: e.completedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString(),
    courseTitle: e.courseTitle, courseSlug: e.courseSlug, thumbnailUrl: e.thumbnailUrl,
  }));

  const displayName = user.user_metadata?.['full_name'] ?? user.email?.split('@')[0] ?? 'there';
  const inProgress = enrollments.filter((e) => !e.completedAt);
  const completed = enrollments.filter((e) => !!e.completedAt);

  return (
    <Stack gap="xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.9rem] border border-slate-200/80 bg-white p-8 shadow-soft">
            <Stack gap={4}>
              <Title order={1} fz="h2" c="primary.7" className="font-display">
                Welcome back, {displayName}
              </Title>
              <Text c="dimmed">Here&apos;s your BUKZ activity at a glance.</Text>
            </Stack>
          </div>
          <div className="rounded-[1.9rem] border border-slate-200/80 bg-[#0f2a2e] p-8 shadow-soft">
            <Text size="xs" fw={700} c="accent.3" tt="uppercase">
              Momentum
            </Text>
            <Title order={2} fz="h3" mt="sm" className="!text-white">
              Keep applications and learning moving this week.
            </Title>
            <Text size="sm" mt="sm" className="text-slate-300">
              Review active roles, continue your courses, and track shortlisted opportunities from one dashboard.
            </Text>
          </div>
        </div>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <StatCard label="Applications" value={applications.length} href="/jobs" />
          <StatCard label="Courses enrolled" value={enrollments.length} href="/dashboard/learn" />
          <StatCard label="Courses completed" value={completed.length} href="/dashboard/learn" />
          <StatCard
            label="Shortlisted"
            value={applications.filter((a) => a.status === 'shortlisted' || a.status === 'offered').length}
            href="/jobs"
            highlight
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card withBorder radius="xl" p="lg" className="surface-panel surface-border shadow-soft">
            <Group justify="space-between" mb="md">
              <Title order={2} fz="md" c="primary.7">
                Recent applications
              </Title>
              <Anchor component={Link} href="/jobs" size="xs" c="accent">
                Browse more jobs
              </Anchor>
            </Group>
            {applications.length === 0 ? (
              <EmptyState message="No applications yet." cta="Find your next role" href="/jobs" />
            ) : (
              <Stack gap={0}>
                {applications.slice(0, 5).map((app) => (
                  <Box key={app.id} py="sm">
                    <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
                      <Box miw={0}>
                        <Anchor component={Link} href={`/jobs/${app.jobSlug}`} size="sm" fw={600} c="primary.7">
                          {app.jobTitle}
                        </Anchor>
                        <Text size="xs" c="dimmed">
                          {app.jobLocation} · {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Text>
                      </Box>
                      <Badge color={STATUS_COLOURS[app.status] ?? 'gray'} variant="light">
                        {app.status}
                      </Badge>
                    </Group>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>

          <Card withBorder radius="xl" p="lg" className="surface-panel surface-border shadow-soft">
            <Group justify="space-between" mb="md">
              <Title order={2} fz="md" c="primary.7">
                Courses in progress
              </Title>
              <Anchor component={Link} href="/dashboard/learn" size="xs" c="accent">
                All learning
              </Anchor>
            </Group>
            {inProgress.length === 0 ? (
              <EmptyState message="No courses enrolled yet." cta="Browse courses" href="/learn" />
            ) : (
              <Stack gap="md">
                {inProgress.slice(0, 4).map((e) => (
                  <Stack key={e.id} gap={6}>
                    <Anchor component={Link} href={`/learn/${e.courseSlug}`} size="sm" fw={600} c="primary.7">
                      {e.courseTitle}
                    </Anchor>
                    <Group gap="sm" wrap="nowrap">
                      <Progress value={e.progressPercent ?? 0} color="accent" flex={1} size="sm" radius="xl" />
                      <Text size="xs" c="dimmed">
                        {e.progressPercent ?? 0}%
                      </Text>
                    </Group>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </SimpleGrid>

        <Card withBorder radius="xl" p="lg" className="border border-[#2cd7f2]/20 bg-[#edf9fd] shadow-soft">
          <Group justify="space-between" align="center" gap="md">
            <Stack gap={4} flex={1}>
              <Title order={2} fz="lg" c="primary.7">
                AI Skills Gap Analysis
              </Title>
              <Text size="sm" c="dimmed">
                Get a personalised analysis of your skills versus current UK market demand, with course recommendations to close the gap.
              </Text>
            </Stack>
            <SkillsGapButton token={token} />
          </Group>
        </Card>
    </Stack>
  );
}

function StatCard({ label, value, href, highlight = false }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Card component={Link} href={href} withBorder radius="xl" p="md" className="surface-panel surface-border shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
      <Text fz={32} fw={700} c={highlight ? 'accent' : 'primary.7'} lh={1}>
        {value}
      </Text>
      <Text mt={4} size="sm" c="dimmed">
        {label}
      </Text>
    </Card>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <Stack py="xl" align="center" gap={6}>
      <Text size="sm" c="dimmed">{message}</Text>
      <Anchor component={Link} href={href} size="sm" fw={600} c="accent">
        {cta}
      </Anchor>
    </Stack>
  );
}
