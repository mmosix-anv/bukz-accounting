'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Alert, Anchor, Button, Card, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';

interface Props {
  user: { name: string; email: string };
}

export function SettingsForm({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify({ name }) });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPassword = fd.get('currentPassword') as string;
    const pw = fd.get('password') as string;
    const confirm = fd.get('confirm') as string;
    if (pw !== confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true); setPwError(null); setPwSaved(false);
    try {
      await apiFetch('/auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword: pw }) });
      setPwSaved(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setPwError((err as Error).message);
    }
    setPwSaving(false);
  }

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" p="lg">
        <Title order={2} fz="lg" c="primary.7" mb="md">Profile</Title>
        <form onSubmit={saveProfile}>
          <Stack gap="md">
          {error && <Alert color="red" variant="light">{error}</Alert>}
          {saved && <Alert color="green" variant="light">Saved successfully.</Alert>}
          <TextInput id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextInput label="Email address" value={user.email} disabled />
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
          </Stack>
        </form>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={2} fz="lg" c="primary.7" mb="md">Change password</Title>
        <form onSubmit={changePassword}>
          <Stack gap="md">
          {pwError && <Alert color="red" variant="light">{pwError}</Alert>}
          {pwSaved && <Alert color="green" variant="light">Password updated.</Alert>}
          <PasswordInput id="currentPassword" name="currentPassword" label="Current password" required autoComplete="current-password" />
          <PasswordInput id="password" name="password" label="New password" required minLength={8} autoComplete="new-password" />
          <PasswordInput id="confirm" name="confirm" label="Confirm password" required minLength={8} autoComplete="new-password" />
          <Button type="submit" loading={pwSaving}>
            Update password
          </Button>
          </Stack>
        </form>
      </Card>

      <Card withBorder radius="md" p="lg" bg="red.0">
        <Title order={2} fz="lg" c="red.7">Danger zone</Title>
        <Text size="sm" c="red.7" mt={4} mb="md">Deleting your account is permanent and cannot be undone.</Text>
        <Anchor href="mailto:support@bukzaccounting.co.uk?subject=Account deletion request" c="red.7" fw={600}>
          Request account deletion
        </Anchor>
      </Card>
    </Stack>
  );
}
