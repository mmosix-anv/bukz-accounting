import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Anchor, Badge, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'My Applications | BUKZ' };

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  createdAt: string;
  jobTitle: string;
  jobSlug: string;
  jobLocation: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  submitted: 'blue',
  viewed: 'gray',
  shortlisted: 'green',
  offered: 'yellow',
  rejected: 'red',
};

function fmt(min: string | null, max: string | null, currency: string | null) {
  const c = currency ?? 'GBP';
  const f = (v: string) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(Number(v));
  if (min && max) return `${f(min)} – ${f(max)}`;
  if (min) return `From ${f(min)}`;
  if (max) return `Up to ${f(max)}`;
  return null;
}

export default async function ApplicationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/dashboard/applications');

  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const applications = await apiFetch<Application[]>('/jobs/applications/my', { token }).catch(() => [] as Application[]);

  const grouped = {
    active: applications.filter((a) => !['rejected'].includes(a.status)),
    rejected: applications.filter((a) => a.status === 'rejected'),
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1} fz="h2" c="primary.7">My Applications</Title>
          <Text c="dimmed">{applications.length} application{applications.length !== 1 ? 's' : ''} total</Text>
        </Stack>
        <Button component={Link} href="/jobs">
          Find more jobs
        </Button>
      </Group>

      {applications.length === 0 ? (
        <Card withBorder radius="md" py={64} ta="center">
          <Text c="dimmed">You haven&apos;t applied to any jobs yet.</Text>
          <Anchor component={Link} href="/jobs" mt="xs" size="sm" fw={600} c="accent">
            Browse open roles
          </Anchor>
        </Card>
      ) : (
        <Stack gap="xl">
          {grouped.active.length > 0 && (
            <Stack gap="sm">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Active ({grouped.active.length})</Text>
              <Stack gap="sm">
                {grouped.active.map((app) => <ApplicationRow key={app.id} app={app} />)}
              </Stack>
            </Stack>
          )}
          {grouped.rejected.length > 0 && (
            <Stack gap="sm" opacity={0.64}>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Unsuccessful ({grouped.rejected.length})</Text>
              <Stack gap="sm">
                {grouped.rejected.map((app) => <ApplicationRow key={app.id} app={app} />)}
              </Stack>
            </Stack>
          )}
        </Stack>
      )}
      </Stack>
    </Container>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const salary = fmt(app.salaryMin, app.salaryMax, app.salaryCurrency);
  const date = new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" align="center" gap="md">
      <Stack gap={3} flex={1}>
        <Anchor component={Link} href={`/jobs/${app.jobSlug}`} fw={600} c="primary.7">
          {app.jobTitle}
        </Anchor>
        <Text size="sm" c="dimmed">
          {app.jobLocation}{salary ? ` · ${salary}` : ''}
        </Text>
        <Text size="xs" c="dimmed">Applied {date}</Text>
      </Stack>
      <Badge color={STATUS_COLOURS[app.status] ?? 'gray'} variant="light">
        {app.status === 'shortlisted' ? 'Shortlisted' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
      </Badge>
      </Group>
    </Card>
  );
}
