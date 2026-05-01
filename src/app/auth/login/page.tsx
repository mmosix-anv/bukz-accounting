import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';
import { Alert, Anchor, Center, Paper, Stack, Text } from '@mantine/core';

export const metadata: Metadata = { title: 'Log in — BUKZ' };

interface Props {
  searchParams: { redirectTo?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <Center mih="100vh" bg="gray.0" px="md">
      <Stack w="100%" maw={380} gap="lg">
        <Stack align="center" gap={6}>
          <Anchor component={Link} href="/" fz={32} fw={800} c="primary.7" underline="never">
            BUKZ
          </Anchor>
          <Text c="dimmed">Welcome back</Text>
        </Stack>

        {searchParams.error && (
          <Alert color="red" variant="light">
            {decodeURIComponent(searchParams.error)}
          </Alert>
        )}

        <Paper withBorder radius="md" p="xl">
          <LoginForm redirectTo={searchParams.redirectTo} />
          <Text mt="lg" ta="center" size="sm" c="dimmed">
            No account?{' '}
            <Anchor component={Link} href="/auth/register" fw={600}>
              Get started free
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Center>
  );
}
