'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';

interface ExpertData {
  id?: string;
  name?: string;
  title?: string;
  bio?: string;
  specialisations?: string[];
  qualifications?: string[];
  hourlyRateGbp?: string;
  calUsername?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export function ExpertForm({ token, expert }: { token?: string; expert?: ExpertData }) {
  const router = useRouter();
  const isEdit = !!expert?.id;
  const [form, setForm] = useState({
    name: expert?.name ?? '',
    title: expert?.title ?? '',
    bio: expert?.bio ?? '',
    specialisations: expert?.specialisations?.join(', ') ?? '',
    qualifications: expert?.qualifications?.join(', ') ?? '',
    hourlyRateGbp: expert?.hourlyRateGbp ?? '',
    calUsername: expert?.calUsername ?? '',
    isVerified: expert?.isVerified ?? false,
    isActive: expert?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const url = isEdit
      ? `${apiUrl}/api/v1/insight/experts/${expert!.id}`
      : `${apiUrl}/api/v1/insight/experts`;

    const body = {
      name: form.name,
      title: form.title,
      bio: form.bio,
      specialisations: form.specialisations.split(',').map((s) => s.trim()).filter(Boolean),
      qualifications: form.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
      hourlyRateGbp: form.hourlyRateGbp || null,
      calUsername: form.calUsername || null,
      isVerified: form.isVerified,
      isActive: form.isActive,
    };

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError('Failed to save expert.');
      return;
    }
    router.push('/admin/experts');
  }

  return (
    <Card component="form" onSubmit={(event) => void save(event)} withBorder radius="md" p="lg">
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Full name"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.currentTarget.value }))}
          />
          <TextInput
            label="Professional title"
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.currentTarget.value }))}
            placeholder="e.g. Tax Specialist"
          />
        </SimpleGrid>

        <Textarea
          label="Bio"
          minRows={4}
          value={form.bio}
          onChange={(event) => setForm((prev) => ({ ...prev, bio: event.currentTarget.value }))}
        />

        <TextInput
          label="Specialisations"
          description="Comma-separated"
          value={form.specialisations}
          onChange={(event) => setForm((prev) => ({ ...prev, specialisations: event.currentTarget.value }))}
          placeholder="Corporation Tax, VAT, IR35"
        />

        <TextInput
          label="Qualifications"
          description="Comma-separated"
          value={form.qualifications}
          onChange={(event) => setForm((prev) => ({ ...prev, qualifications: event.currentTarget.value }))}
          placeholder="FCCA, CTA, ACA"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput
            label="Hourly rate (GBP)"
            min={0}
            value={form.hourlyRateGbp}
            onChange={(value) => setForm((prev) => ({ ...prev, hourlyRateGbp: value ? String(value) : '' }))}
            placeholder="150"
          />
          <TextInput
            label="Cal.com username"
            value={form.calUsername}
            onChange={(event) => setForm((prev) => ({ ...prev, calUsername: event.currentTarget.value }))}
            placeholder="sarah-chen-fcca"
          />
        </SimpleGrid>

        <Group gap="xl">
          <Checkbox
            label="Verified expert"
            checked={form.isVerified}
            onChange={(event) => setForm((prev) => ({ ...prev, isVerified: event.currentTarget.checked }))}
          />
          <Checkbox
            label="Active (visible on directory)"
            checked={form.isActive}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.currentTarget.checked }))}
          />
        </Group>

        <Button type="submit" loading={saving} fullWidth>
          {isEdit ? 'Save changes' : 'Create expert'}
        </Button>
      </Stack>
    </Card>
  );
}
