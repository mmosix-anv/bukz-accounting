'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Anchor, Box, Button, Group, Paper, PasswordInput, Radio, Stack, Text, TextInput } from '@mantine/core';
import { registerAction } from '@/lib/auth-actions';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  role: z.enum(['candidate', 'employer', 'instructor']),
});

type FormValues = z.infer<typeof schema>;

const roles = [
  {
    value: 'candidate' as const,
    label: 'Accounting professional',
    description: 'Looking for jobs or CPD courses',
  },
  {
    value: 'employer' as const,
    label: 'Employer / Recruiter',
    description: 'Hiring accounting & finance talent',
  },
  {
    value: 'instructor' as const,
    label: 'Course instructor',
    description: 'Creating CPD-accredited courses',
  },
];

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'candidate' },
  });

  const selectedRole = watch('role');

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.set(k, v));

    const result = await registerAction(fd);
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
          label="Full name"
          placeholder="Jane Smith"
          autoComplete="name"
          disabled={isSubmitting}
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register('password')}
        />

        <div>
          <Radio.Group
            value={selectedRole}
            onChange={(value) => setValue('role', value as FormValues['role'])}
            label="I am a…"
          >
            <Stack gap="sm" mt="xs">
              {roles.map((r) => {
                const selected = selectedRole === r.value;
                return (
                  <Paper
                    key={r.value}
                    withBorder
                    p="md"
                    radius="md"
                    onClick={() => setValue('role', r.value)}
                    mod={{ selected }}
                    bg={selected ? 'primary.0' : undefined}
                    bd={selected ? '1px solid var(--mantine-color-primary-6)' : undefined}
                  >
                    <Group align="flex-start" wrap="nowrap" gap="sm">
                      <Radio value={r.value} mt={2} />
                      <Box miw={0}>
                        <Text size="sm" fw={600} c="primary">
                          {r.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {r.description}
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Radio.Group>

          <input type="hidden" {...register('role')} />
          {errors.role && (
            <Text size="xs" c="red" mt={6}>
              {errors.role.message}
            </Text>
          )}
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} color="primary">
          Create account
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          By creating an account you agree to our <Anchor href="/terms">Terms of Service</Anchor> and{' '}
          <Anchor href="/privacy">Privacy Policy</Anchor>.
        </Text>
      </Stack>
    </form>
  );
}
