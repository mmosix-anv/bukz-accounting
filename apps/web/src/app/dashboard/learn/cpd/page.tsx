import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Anchor, Card, Container, Group, Progress, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'CPD Log | BUKZ Learn' };

interface CpdEntry {
  id: string;
  courseId: string | null;
  activityType: string;
  title: string;
  hoursSpent: string;
  completedAt: string;
  notes: string | null;
  courseTitle?: string;
}

interface CpdSummary {
  year: number;
  totalHours: number;
  requirements: { body: string; required: number; completed: number; remaining: number; percentage: number; met: boolean }[];
}

export default async function CpdPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/dashboard/learn/cpd');

  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const [entries, summary] = await Promise.all([
    apiFetch<CpdEntry[]>('/learn/cpd/my', { token }).catch(() => [] as CpdEntry[]),
    apiFetch<CpdSummary>('/learn/cpd/my/summary', { token }).catch(() => null),
  ]);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1} fz="h2" c="primary.7">CPD Log</Title>
          <Text c="dimmed">Track your continuing professional development hours</Text>
        </Stack>
        <Anchor component={Link} href="/dashboard/learn" c="accent" size="sm">My Learning</Anchor>
      </Group>

      {summary && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder radius="md" p="lg" ta="center">
            <Text fz={32} fw={700} c="primary.7" lh={1}>{summary.totalHours}</Text>
            <Text size="sm" c="dimmed" mt={4}>Total CPD hours ({summary.year})</Text>
          </Card>
          {summary.requirements.map((req) => (
            <Card key={req.body} withBorder radius="md" p="lg">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">{req.body}</Text>
              <Group mt="xs" align="baseline" gap="xs">
                <Text fz={26} fw={700} c="primary.7">{req.completed}</Text>
                <Text size="sm" c="dimmed">/ {req.required} hrs</Text>
              </Group>
              <Progress mt="xs" value={Math.min(req.percentage, 100)} color={req.met ? 'green' : 'accent'} size="sm" radius="xl" />
              <Text mt={4} size="xs" fw={600} c={req.met ? 'green' : 'yellow.7'}>
                {req.met ? 'Requirement met' : `${req.remaining} hrs remaining`}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Stack gap="md">
        <Title order={2} fz="lg" c="primary.7">Activity log</Title>
        {entries.length === 0 ? (
          <Card withBorder radius="md" py="xl" ta="center">
            <Text c="dimmed">No CPD activities recorded yet.</Text>
            <Text size="sm" c="dimmed">Complete a course to automatically log CPD hours.</Text>
            <Anchor component={Link} href="/learn" size="sm" fw={600} c="accent" mt="xs">Browse courses</Anchor>
          </Card>
        ) : (
          <Card withBorder radius="md" p={0}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Activity</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th ta="right">Hours</Table.Th>
                  <Table.Th ta="right">Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {entries.map((e) => (
                  <Table.Tr key={e.id}>
                    <Table.Td><Text fw={600} c="primary.7">{e.title}</Text></Table.Td>
                    <Table.Td><Text c="dimmed" tt="capitalize">{e.activityType}</Text></Table.Td>
                    <Table.Td ta="right"><Text fw={700} c="primary.7">{Number(e.hoursSpent).toFixed(1)}</Text></Table.Td>
                    <Table.Td ta="right">
                      <Text c="dimmed">
                      {new Date(e.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td colSpan={2}><Text fw={700} c="primary.7">Total</Text></Table.Td>
                  <Table.Td ta="right"><Text fw={700} c="primary.7">
                    {entries.reduce((acc, e) => acc + Number(e.hoursSpent), 0).toFixed(1)}
                  </Text></Table.Td>
                  <Table.Td />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Card>
        )}
      </Stack>
      </Stack>
    </Container>
  );
}
