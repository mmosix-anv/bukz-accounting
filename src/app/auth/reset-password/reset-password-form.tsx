'use client';

import { useState } from 'react';
import { resetPasswordAction } from '@/lib/auth-actions';
import { Alert, Button, Paper, PasswordInput, Stack } from '@mantine/core';

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('password') !== fd.get('confirm')) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await resetPasswordAction(fd);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} withBorder radius="md" p="xl">
      <Stack gap="md">
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
        <PasswordInput
          id="password" name="password" type="password" required minLength={8}
          label="New password"
        />
        <PasswordInput
          id="confirm" name="confirm" type="password" required minLength={8}
          label="Confirm password"
        />
        <Button type="submit" loading={loading} fullWidth>
          Set new password
        </Button>
      </Stack>
    </Paper>
  );
}
