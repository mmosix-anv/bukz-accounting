'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Select, TextInput, Stack, Group, Badge, Card, Text, Title, Table, Progress } from '@mantine/core';
import { apiFetch } from '@/lib/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  profile: {
    bio: string | null;
    location: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  } | null;
  enrollments: { id: string; courseTitle: string; progressPercent: number; completedAt: string | null; createdAt: string }[];
  applications: { id: string; status: string; createdAt: string; jobTitle: string }[];
  payments: { id: string; amountPence: number; currency: string; status: string; description: string; createdAt: string }[];
}

const ROLE_COLOURS: Record<string, string> = {
  candidate: 'blue',
  employer: 'green',
  instructor: 'violet',
  admin: 'yellow',
};

const APP_STATUS_COLOURS: Record<string, string> = {
  submitted: 'blue',
  viewed: 'gray',
  shortlisted: 'green',
  offered: 'yellow',
  rejected: 'red',
};

export function UserEditForm({ user, token }: { user: UserData; token: string | undefined }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  async function handleRoleChange() {
    if (role === user.role) return;
    setSaving(true);
    await apiFetch(`/admin/users/${user.id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ role }),
    }).catch(() => null);
    setSaving(false);
    router.refresh();
  }

  return (
    <Stack gap="lg">
      <Card withBorder radius="xl" p="lg" className="shadow-soft">
        <Group align="flex-start" gap="lg">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-16 w-16 object-cover" />
            ) : (
              <span className="text-xl font-bold text-slate-500">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <Stack gap={4} flex={1}>
            <Title order={2} size="h3" c="primary.7">{user.name || 'Unnamed'}</Title>
            <Text size="sm" c="dimmed">{user.email}</Text>
            <Text size="xs" c="dimmed">
              Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Stack>
          <Badge color={ROLE_COLOURS[user.role] ?? 'gray'} size="lg" variant="light">
            {user.role}
          </Badge>
        </Group>
      </Card>

      <Card withBorder radius="xl" p="lg" className="shadow-soft">
        <Title order={3} size="h4" mb="md">Role Management</Title>
        <Group align="flex-end" gap="md">
          <Select
            label="User Role"
            value={role}
            onChange={(v) => setRole(v ?? user.role)}
            data={[
              { value: 'candidate', label: 'Candidate' },
              { value: 'employer', label: 'Employer' },
              { value: 'instructor', label: 'Instructor' },
              { value: 'admin', label: 'Admin' },
            ]}
            w={200}
          />
          <Button onClick={() => void handleRoleChange()} loading={saving} disabled={role === user.role}>
            Update Role
          </Button>
        </Group>
      </Card>

      {user.profile && (
        <Card withBorder radius="xl" p="lg" className="shadow-soft">
          <Title order={3} size="h4" mb="md">Profile</Title>
          <Stack gap="sm">
            <TextInput label="Location" value={user.profile.location ?? ''} readOnly />
            <TextInput label="Phone" value={user.profile.phone ?? ''} readOnly />
            <TextInput label="LinkedIn" value={user.profile.linkedinUrl ?? ''} readOnly />
            <TextInput label="Website" value={user.profile.websiteUrl ?? ''} readOnly />
            {user.profile.bio && <Text size="sm" c="dimmed">{user.profile.bio}</Text>}
          </Stack>
        </Card>
      )}

      {user.enrollments.length > 0 && (
        <Card withBorder radius="xl" p="lg" className="shadow-soft">
          <Title order={3} size="h4" mb="md">Enrollments ({user.enrollments.length})</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Course</Table.Th>
                <Table.Th>Progress</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Enrolled</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {user.enrollments.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text fw={600} size="sm">{e.courseTitle}</Text></Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Progress value={e.progressPercent} flex={1} size="sm" radius="xl" color="accent" />
                      <Text size="xs" c="dimmed" w={36} ta="right">{e.progressPercent}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={e.completedAt ? 'green' : 'blue'} variant="light" size="sm">
                      {e.completedAt ? 'Completed' : 'In Progress'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(e.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {user.applications.length > 0 && (
        <Card withBorder radius="xl" p="lg" className="shadow-soft">
          <Title order={3} size="h4" mb="md">Applications ({user.applications.length})</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Job</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Applied</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {user.applications.map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td><Text fw={600} size="sm">{a.jobTitle}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={APP_STATUS_COLOURS[a.status] ?? 'gray'} variant="light" size="sm">
                      {a.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {user.payments.length > 0 && (
        <Card withBorder radius="xl" p="lg" className="shadow-soft">
          <Title order={3} size="h4" mb="md">Payments ({user.payments.length})</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Description</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {user.payments.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td><Text size="sm">{p.description}</Text></Table.Td>
                  <Table.Td>
                    <Text fw={600} size="sm">
                      £{(p.amountPence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={p.status === 'completed' ? 'green' : p.status === 'failed' ? 'red' : 'yellow'} variant="light" size="sm">
                      {p.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
