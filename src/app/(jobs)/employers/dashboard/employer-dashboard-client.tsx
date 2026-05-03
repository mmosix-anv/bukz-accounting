'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { Anchor, Badge, Box, Card, Group, Loader, NativeSelect, SimpleGrid, Stack, Table, Tabs, Text, ThemeIcon, Title } from '@mantine/core';
import { BarChart3, BriefcaseBusiness, Eye, Inbox } from 'lucide-react';

interface Stats {
  activeListings: number;
  totalApplications: number;
  totalViews: number;
  totalListings: number;
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: string;
  applicationsCount: number;
  viewsCount: number;
  featured: boolean;
  expiresAt: string | null;
  createdAt: string;
  jobType: string;
  location: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  jobTitle: string;
  jobId: string;
  candidateId: string;
  coverLetter: string | null;
}

interface Props {
  stats: Stats;
  listings: Listing[];
  token: string | undefined;
}

const STATUS_COLOURS: Record<string, string> = {
  active: 'green',
  draft: 'gray',
  expired: 'red',
  filled: 'blue',
};

const APP_STATUS_COLOURS: Record<string, string> = {
  submitted: 'gray',
  viewed: 'blue',
  shortlisted: 'green',
  rejected: 'red',
  offered: 'accent',
};

function generateChartData(listings: Listing[]) {
  const days: { date: string; applications: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const appsOnDay = listings.reduce((sum, l) => {
      const created = new Date(l.createdAt);
      const same = created.toDateString() === d.toDateString();
      return sum + (same ? (l.applicationsCount ?? 0) : 0);
    }, 0);
    days.push({ date: label, applications: appsOnDay });
  }
  return days;
}

export function EmployerDashboardClient({ stats, listings, token }: Props) {
  const [tab, setTab] = useState<'listings' | 'applications'>('listings');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appStatuses, setAppStatuses] = useState<Record<string, string>>({});

  const chartData = generateChartData(listings);
  const statCards = [
    { label: 'Active listings', value: stats.activeListings, icon: BriefcaseBusiness },
    { label: 'Total applications', value: stats.totalApplications, icon: Inbox },
    { label: 'Total views', value: stats.totalViews, icon: Eye },
    { label: 'All listings', value: stats.totalListings, icon: BarChart3 },
  ];

  async function loadApplications() {
    if (applications.length > 0) { setTab('applications'); return; }
    setLoadingApps(true);
    try {
      const data = await apiFetch<Application[]>('/jobs/applications/received', { token });
      setApplications(data);
    } finally {
      setLoadingApps(false);
    }
    setTab('applications');
  }

  async function updateAppStatus(id: string, status: string) {
    setAppStatuses((prev) => ({ ...prev, [id]: status }));
    await apiFetch(`/jobs/applications/${id}/status`, {
      method: 'PATCH', token, body: JSON.stringify({ status }),
    });
  }

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
          <Card key={s.label} withBorder radius="md" p="md">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon color="primary" variant="light" radius="md">
                <Icon size={18} />
              </ThemeIcon>
              <Box>
                <Text fz={26} fw={700} c="primary.7" lh={1}>{s.value}</Text>
                <Text size="xs" c="dimmed">{s.label}</Text>
              </Box>
            </Group>
          </Card>
          );
        })}
      </SimpleGrid>

      <Card withBorder radius="md" p="lg">
        <Title order={2} fz="md" c="primary.7" mb="md">Applications over the last 30 days</Title>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="applications" stroke="#0f2a2e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card withBorder radius="md" p={0}>
        <Tabs
          value={tab}
          onChange={(value) => {
            if (value === 'applications') {
              void loadApplications();
            } else {
              setTab('listings');
            }
          }}
          keepMounted={false}
        >
          <Tabs.List px="md">
            <Tabs.Tab value="listings">My listings</Tabs.Tab>
            <Tabs.Tab value="applications">Applications received</Tabs.Tab>
          </Tabs.List>

        <Tabs.Panel value="listings">
          <Box>
            {listings.length === 0 ? (
              <Stack py="xl" align="center">
                <Text c="dimmed">No listings yet.</Text>
                <Anchor component={Link} href="/employers/post-job" size="sm" fw={600}>Post your first job</Anchor>
              </Stack>
            ) : (
              <Table.ScrollContainer minWidth={760}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {['Title', 'Status', 'Applications', 'Views', 'Expires', 'Actions'].map((h) => (
                        <Table.Th key={h}>{h}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {listings.map((l) => (
                      <Table.Tr key={l.id}>
                        <Table.Td>
                          <Anchor component={Link} href={`/jobs/${l.slug}`} fw={600} c="primary.7">{l.title}</Anchor>
                          <Text size="xs" c="dimmed">{l.location}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <Badge color={STATUS_COLOURS[l.status] ?? 'gray'} variant="light">
                              {l.status}
                            </Badge>
                            {l.featured && <Badge color="accent" variant="light">Featured</Badge>}
                          </Group>
                        </Table.Td>
                        <Table.Td>{l.applicationsCount}</Table.Td>
                        <Table.Td>{l.viewsCount}</Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('en-GB') : '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Anchor component={Link} href={`/jobs/${l.slug}`} size="xs">View</Anchor>
                            <Anchor component={Link} href={`/employers/jobs/${l.id}/edit`} size="xs" c="dimmed">Edit</Anchor>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="applications">
          <Box>
            {loadingApps ? (
              <Group justify="center" py="xl"><Loader size="sm" /></Group>
            ) : applications.length === 0 ? (
              <Text py="xl" ta="center" c="dimmed" size="sm">No applications received yet.</Text>
            ) : (
              <Table.ScrollContainer minWidth={760}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {['Job', 'Applied', 'Cover letter', 'Status'].map((h) => (
                        <Table.Th key={h}>{h}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {applications.map((a) => (
                      <Table.Tr key={a.id}>
                        <Table.Td>
                          <Text fw={600} c="primary.7">{a.jobTitle}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{new Date(a.createdAt).toLocaleDateString('en-GB')}</Text>
                        </Table.Td>
                        <Table.Td maw={280}>
                          <Text size="xs" c="dimmed" lineClamp={2}>{a.coverLetter ?? '-'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <NativeSelect
                            value={appStatuses[a.id] ?? a.status}
                            onChange={(e) => updateAppStatus(a.id, e.target.value)}
                            data={['submitted', 'viewed', 'shortlisted', 'rejected', 'offered']}
                            size="xs"
                            c={APP_STATUS_COLOURS[appStatuses[a.id] ?? a.status] ?? 'gray'}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Box>
        </Tabs.Panel>
        </Tabs>
      </Card>
    </Stack>
  );
}
