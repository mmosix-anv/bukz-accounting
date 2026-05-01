'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Progress,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BookOpen, GraduationCap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Enrollment {
  id: string;
  courseId: string;
  progressPercent: number;
  completedAt: string | null;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
  cpdHours: string;
  level: string;
}

interface Certificate {
  id: string;
  issuedAt: string;
  courseTitle: string;
  cpdHours: string;
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

interface Props {
  enrollments: Enrollment[];
  certificates: Certificate[];
  cpdSummary: CpdSummary | null;
  token: string | undefined;
}

const LEVEL_COLOURS: Record<string, string> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

function CourseProgressCard({ enrollment }: { enrollment: Enrollment }) {
  const isComplete = enrollment.progressPercent === 100;

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group align="flex-start" wrap="nowrap">
          <ThemeIcon size={52} radius="md" variant="light" color="primary">
            <BookOpen size={24} />
          </ThemeIcon>
          <Box miw={0}>
            <Anchor component={Link} href={`/learn/${enrollment.courseSlug}`} fw={700} c="primary.8">
              {enrollment.courseTitle}
            </Anchor>
            <Group gap="xs" mt={6}>
              <Badge color={LEVEL_COLOURS[enrollment.level] ?? 'gray'} variant="light">
                {enrollment.level}
              </Badge>
              <Text size="xs" c="dimmed">
                {enrollment.cpdHours} CPD hrs
              </Text>
            </Group>
          </Box>
        </Group>

        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Progress
            </Text>
            <Text size="xs" fw={700} c="primary.8">
              {enrollment.progressPercent}%
            </Text>
          </Group>
          <Progress value={enrollment.progressPercent} color={isComplete ? 'green' : 'primary'} />
        </Stack>

        <Button
          component={Link}
          href={isComplete ? `/dashboard/learn/certificates/${enrollment.courseId}` : `/learn/${enrollment.courseSlug}`}
          color={isComplete ? 'green' : 'primary'}
          fullWidth
        >
          {isComplete ? 'View certificate' : 'Continue learning'}
        </Button>
      </Stack>
    </Card>
  );
}

function EmptyState({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <Text size="sm" c="dimmed" ta="center">
        {children}
      </Text>
      {action}
    </Stack>
  );
}

export function LearnDashboardClient({ enrollments, certificates, cpdSummary, token }: Props) {
  const [tab, setTab] = useState<string | null>('in-progress');
  const [showManualCpd, setShowManualCpd] = useState(false);
  const [manualHours, setManualHours] = useState<string | number>('');
  const [manualDescription, setManualDescription] = useState('');

  const inProgress = enrollments.filter((e) => e.progressPercent < 100);
  const completed = enrollments.filter((e) => e.progressPercent === 100);

  async function submitManualCpd() {
    if (!manualHours || !manualDescription) return;
    const supabase = (await import('@/lib/supabase/client')).createClient();
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token ?? token;
    await (await import('@/lib/api')).apiFetch('/learn/cpd/manual', {
      method: 'POST',
      token: t,
      body: JSON.stringify({ hours: Number(manualHours), activityDescription: manualDescription }),
    });
    setShowManualCpd(false);
    setManualHours('');
    setManualDescription('');
  }

  return (
    <Stack gap="lg">
      {cpdSummary && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Card withBorder radius="md" p="lg">
            <Text fz={34} fw={800} c="primary.8" lh={1}>
              {cpdSummary.totalHours}
            </Text>
            <Text size="xs" c="dimmed" mt={6}>
              CPD hours this year
            </Text>
          </Card>
          {cpdSummary.requirements.slice(0, 3).map((requirement) => (
            <Card key={requirement.body} withBorder radius="md" p="lg">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" fw={700} c="dimmed">
                    {requirement.body}
                  </Text>
                  {requirement.met && (
                    <Badge color="green" variant="light">
                      Met
                    </Badge>
                  )}
                </Group>
                <Progress value={requirement.percentage} color={requirement.met ? 'green' : 'primary'} size="sm" />
                <Text size="xs" c="dimmed">
                  {requirement.completed}/{requirement.required} hrs
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Tabs value={tab} onChange={setTab} variant="outline" radius="md">
        <Tabs.List>
          <Tabs.Tab value="in-progress">In Progress ({inProgress.length})</Tabs.Tab>
          <Tabs.Tab value="completed">Completed ({completed.length})</Tabs.Tab>
          <Tabs.Tab value="cpd">CPD Log</Tabs.Tab>
          <Tabs.Tab value="certificates">Certificates ({certificates.length})</Tabs.Tab>
        </Tabs.List>

        <Card withBorder radius="md" p="lg" mt="md">
          <Tabs.Panel value="in-progress">
            {inProgress.length === 0 ? (
              <EmptyState
                action={
                  <Anchor component={Link} href="/learn" fw={600}>
                    Browse courses
                  </Anchor>
                }
              >
                No courses in progress.
              </EmptyState>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                {inProgress.map((enrollment) => (
                  <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="completed">
            {completed.length === 0 ? (
              <EmptyState>No completed courses yet.</EmptyState>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                {completed.map((enrollment) => (
                  <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="cpd">
            {cpdSummary ? (
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={2} size="h4">
                    CPD Hours {cpdSummary.year}
                  </Title>
                  <Button variant="outline" onClick={() => setShowManualCpd(true)}>
                    Log manual CPD
                  </Button>
                </Group>

                <Box h={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cpdSummary.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#0D1B3E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <Stack gap="sm">
                  <Text size="sm" fw={700}>
                    Professional body requirements
                  </Text>
                  {cpdSummary.requirements.map((requirement) => (
                    <Group key={requirement.body} wrap="nowrap">
                      <Text w={64} size="sm" fw={600} c="dimmed">
                        {requirement.body}
                      </Text>
                      <Box flex={1}>
                        <Progress
                          value={Math.min(100, requirement.percentage)}
                          color={requirement.met ? 'green' : 'primary'}
                        />
                      </Box>
                      <Text w={112} size="xs" c="dimmed" ta="right">
                        {requirement.completed}/{requirement.required} hrs {requirement.met ? 'Met' : ''}
                      </Text>
                    </Group>
                  ))}
                </Stack>

                {showManualCpd && (
                  <Card withBorder radius="md" p="md" bg="gray.0">
                    <Stack gap="sm">
                      <Text size="sm" fw={700} c="primary.8">
                        Log manual CPD activity
                      </Text>
                      <NumberInput
                        label="Hours"
                        min={0.5}
                        step={0.5}
                        w={120}
                        value={manualHours}
                        onChange={setManualHours}
                      />
                      <TextInput
                        label="Activity description"
                        value={manualDescription}
                        onChange={(event) => setManualDescription(event.currentTarget.value)}
                        placeholder="e.g. Attended ICAEW webinar on MTD"
                      />
                      <Group gap="sm">
                        <Button variant="default" onClick={() => setShowManualCpd(false)}>
                          Cancel
                        </Button>
                        <Button onClick={submitManualCpd}>Save</Button>
                      </Group>
                    </Stack>
                  </Card>
                )}
              </Stack>
            ) : (
              <EmptyState>CPD summary is not available yet.</EmptyState>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="certificates">
            {certificates.length === 0 ? (
              <EmptyState>Complete a course to earn your first certificate.</EmptyState>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                {certificates.map((certificate) => (
                  <Card key={certificate.id} withBorder radius="md" p="lg">
                    <Stack gap="md">
                      <ThemeIcon size={56} radius="xl" variant="light" color="primary" mx="auto">
                        <GraduationCap size={28} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Text fw={700} c="primary.8" lineClamp={2}>
                          {certificate.courseTitle}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {certificate.cpdHours} CPD hours ·{' '}
                          {new Date(certificate.issuedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                        </Text>
                      </Stack>
                      <Group grow gap="sm">
                        <Button
                          component="a"
                          href={`/api/v1/learn/certificates/${certificate.id}/download`}
                          download
                          size="xs"
                        >
                          Download PDF
                        </Button>
                        <Button
                          component="a"
                          href="https://www.linkedin.com/in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outline"
                          size="xs"
                        >
                          Share
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        </Card>
      </Tabs>
    </Stack>
  );
}
