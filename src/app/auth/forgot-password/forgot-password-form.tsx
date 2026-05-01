'use client';

import { useState } from 'react';
import { forgotPasswordAction } from '@/lib/auth-actions';
import { Alert, Button, Paper, Stack, Text, TextInput } from '@mantine/core';

export function ForgotPasswordForm() {
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPasswordAction(new FormData(e.currentTarget));
    setState(result ?? null);
    setLoading(false);
  }

  if (state?.success) {
    return (
      <Alert color="green" title="Check your inbox">
          We&apos;ve sent a password reset link to your email. The link expires in 1 hour.
      </Alert>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} withBorder radius="md" p="xl">
      <Stack gap="md">
        {state?.error && (
          <Alert color="red" variant="light">
            {state.error}
          </Alert>
        )}
        <TextInput
          id="email" name="email" type="email" required autoComplete="email"
          label="Email address"
        />
        <Button type="submit" loading={loading} fullWidth>
          Send reset link
        </Button>
        <Text size="xs" c="dimmed" ta="center">Use the same email you used to create your BUKZ account.</Text>
      </Stack>
    </Paper>
  );
}
