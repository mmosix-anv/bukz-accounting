'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Group, Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';

interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  remotePolicy: string;
  experienceLevel: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  status: string;
}

const JOB_TYPES = ['permanent', 'contract', 'temp', 'interim', 'part_time'];
const REMOTE = ['office', 'hybrid', 'remote'];
const EXPERIENCE = ['entry', 'mid', 'senior', 'manager', 'director'];

export function EditJobForm({ listing, token }: { listing: JobListing; token?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    location: listing.location,
    jobType: listing.jobType,
    remotePolicy: listing.remotePolicy,
    experienceLevel: listing.experienceLevel,
    salaryMin: listing.salaryMin ?? '',
    salaryMax: listing.salaryMax ?? '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/jobs/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError('Failed to save changes.'); return; }
    router.push('/employers/dashboard');
  }

  async function handleDelete() {
    setDeleting(true);
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    await fetch(`${apiUrl}/api/v1/jobs/listings/${listing.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    router.push('/employers/dashboard');
  }

  return (
    <Stack gap="lg">
      <Card component="form" onSubmit={handleSave} withBorder radius="md" p="lg">
        <Stack gap="md">
        {error && <Alert color="red" variant="light">{error}</Alert>}

        <TextInput label="Job title" value={form.title} onChange={(e) => update('title', e.target.value)} required />

        <Textarea label="Description" minRows={8} value={form.description} onChange={(e) => update('description', e.target.value)} required />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} required />
          <Select
            label="Job type"
            value={form.jobType}
            onChange={(value) => update('jobType', value ?? form.jobType)}
            data={JOB_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') }))}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Remote policy"
            value={form.remotePolicy}
            onChange={(value) => update('remotePolicy', value ?? form.remotePolicy)}
            data={REMOTE}
          />
          <Select
            label="Experience level"
            value={form.experienceLevel}
            onChange={(value) => update('experienceLevel', value ?? form.experienceLevel)}
            data={EXPERIENCE}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput type="number" label="Salary min (GBP)" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} placeholder="e.g. 35000" />
          <TextInput type="number" label="Salary max (GBP)" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} placeholder="e.g. 50000" />
        </SimpleGrid>

        <Button type="submit" loading={saving} fullWidth>
          Save changes
        </Button>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg" bg="red.0">
        <Title order={2} fz="md" c="red.7">Delete this listing</Title>
        <Text size="sm" c="red.7" mt={4} mb="md">This will remove the listing from BUKZ Jobs. This action cannot be undone.</Text>
        {confirmDelete ? (
          <Group>
            <Button onClick={handleDelete} loading={deleting} color="red">
              Yes, delete it
            </Button>
            <Button onClick={() => setConfirmDelete(false)} variant="default">
              Cancel
            </Button>
          </Group>
        ) : (
          <Button onClick={() => setConfirmDelete(true)} color="red" variant="light">
            Delete listing
          </Button>
        )}
      </Card>
    </Stack>
  );
}
