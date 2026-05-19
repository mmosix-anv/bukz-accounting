'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { loginAction } from '@/lib/auth-actions';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const fd = new FormData();
    fd.set('email', values.email);
    fd.set('password', values.password);
    if (redirectTo) fd.set('redirectTo', redirectTo);

    const result = await loginAction(fd);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.redirectTo) {
      window.location.href = result.redirectTo;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        {serverError && (
          <Alert color="red" variant="light">
            {serverError}
          </Alert>
        )}

        <TextInput
          label="Email address"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register('password')}
        />

        <Group justify="flex-end">
          <Text component="a" href="/auth/forgot-password" size="xs" c="accent">
            Forgot password?
          </Text>
        </Group>

        <Button type="submit" fullWidth loading={isSubmitting} color="primary">
          Log in
        </Button>

      </Stack>
    </form>
  );
}
