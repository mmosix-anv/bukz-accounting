'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Divider, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { loginAction, signInWithGoogleAction } from '@/lib/auth-actions';

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
    if (result?.error) setServerError(result.error);
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

        <Divider
          label={
            <Text size="xs" c="dimmed">
              or continue with
            </Text>
          }
          labelPosition="center"
        />

        <Button type="button" variant="default" fullWidth onClick={() => signInWithGoogleAction()} disabled={isSubmitting}>
          <Group gap="xs" justify="center">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </Group>
        </Button>
      </Stack>
    </form>
  );
}
