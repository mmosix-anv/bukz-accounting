import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';
import { Anchor, Center, Paper, Stack, Text } from '@mantine/core';

export const metadata: Metadata = { title: 'Create account — BUKZ' };

export default function RegisterPage() {
  return (
    <Center mih="100vh" bg="gray.0" px="md" py="xl">
      <Stack w="100%" maw={380} gap="lg">
        <Stack align="center" gap={6}>
          <Anchor component={Link} href="/" fz={32} fw={800} c="primary.7" underline="never">
            BUKZ
          </Anchor>
          <Text c="dimmed">Create your free account</Text>
        </Stack>
        <Paper withBorder radius="md" p="xl">
          <RegisterForm />
          <Text mt="lg" ta="center" size="sm" c="dimmed">
            Already have an account?{' '}
            <Anchor component={Link} href="/auth/login" fw={600}>
              Log in
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Center>
  );
}
