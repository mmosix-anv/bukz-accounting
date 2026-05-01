import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Center, Stack, Text, Title } from '@mantine/core';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Reset Password | BUKZ' };

export default function ForgotPasswordPage() {
  return (
    <Center mih="100vh" bg="gray.0" px="md">
      <Stack w="100%" maw={420} gap="lg">
        <Stack align="center" gap={6}>
          <Anchor component={Link} href="/" fz={32} fw={800} c="primary.7" underline="never">
            BUKZ
          </Anchor>
          <Title order={1} size="h2" ta="center">
            Forgot your password?
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Enter your email and we&apos;ll send you a reset link.
          </Text>
        </Stack>
        <ForgotPasswordForm />
        <Text ta="center" size="sm" c="dimmed">
          Remember it?{' '}
          <Anchor component={Link} href="/auth/login" fw={600}>
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </Center>
  );
}
