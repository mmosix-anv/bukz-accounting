'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Group, Select, Stack, Switch, TextInput, Textarea, NumberInput } from '@mantine/core';
import { apiFetch } from '@/lib/api';

export function AdminNewJobForm({ token }: { token: string | undefined }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salaryMin: null as number | null,
    salaryMax: null as number | null,
    jobType: 'full_time',
    experienceLevel: 'mid',
    remotePolicy: 'office',
    status: 'draft',
    featured: false,
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Title, description and location are required');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/admin/jobs', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          salaryMin: form.salaryMin ? String(form.salaryMin) : null,
          salaryMax: form.salaryMax ? String(form.salaryMax) : null,
          jobType: form.jobType,
          experienceLevel: form.experienceLevel,
          remotePolicy: form.remotePolicy,
          status: form.status,
          featured: form.featured,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      router.push('/admin/jobs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack gap="lg">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <TextInput label="Title" value={form.title} onChange={(e) => update('title', e.currentTarget.value)} required />
      <Textarea label="Description" minRows={6} value={form.description} onChange={(e) => update('description', e.currentTarget.value)} required />
      <TextInput label="Location" value={form.location} onChange={(e) => update('location', e.currentTarget.value)} required />

      <Group grow>
        <NumberInput label="Salary Min (£)" value={form.salaryMin ?? undefined} onChange={(v) => update('salaryMin', typeof v === 'number' ? v : null)} min={0} />
        <NumberInput label="Salary Max (£)" value={form.salaryMax ?? undefined} onChange={(v) => update('salaryMax', typeof v === 'number' ? v : null)} min={0} />
      </Group>

      <Group grow>
        <Select
          label="Job Type"
          value={form.jobType}
          onChange={(v) => update('jobType', v ?? form.jobType)}
          data={[
            { value: 'full_time', label: 'Full Time' },
            { value: 'part_time', label: 'Part Time' },
            { value: 'contract', label: 'Contract' },
            { value: 'interim', label: 'Interim' },
            { value: 'graduate', label: 'Graduate' },
          ]}
        />
        <Select
          label="Experience Level"
          value={form.experienceLevel}
          onChange={(v) => update('experienceLevel', v ?? form.experienceLevel)}
          data={[
            { value: 'entry', label: 'Entry' },
            { value: 'mid', label: 'Mid' },
            { value: 'senior', label: 'Senior' },
            { value: 'director', label: 'Director' },
            { value: 'cfo', label: 'CFO' },
          ]}
        />
        <Select
          label="Remote Policy"
          value={form.remotePolicy}
          onChange={(v) => update('remotePolicy', v ?? form.remotePolicy)}
          data={[
            { value: 'office', label: 'Office' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'remote', label: 'Remote' },
          ]}
        />
      </Group>

      <Group grow>
        <Select
          label="Status"
          value={form.status}
          onChange={(v) => update('status', v ?? form.status)}
          data={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'expired', label: 'Expired' },
            { value: 'filled', label: 'Filled' },
          ]}
        />
        <TextInput label="Expires At" type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.currentTarget.value)} />
      </Group>

      <Switch label="Featured listing" checked={form.featured} onChange={(e) => update('featured', e.currentTarget.checked)} />

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={() => router.push('/admin/jobs')}>Cancel</Button>
        <Button onClick={() => void handleCreate()} loading={saving}>Create Job</Button>
      </Group>
    </Stack>
  );
}
