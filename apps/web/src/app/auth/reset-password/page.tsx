import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Center, Stack, Text, Title } from '@mantine/core';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Set New Password | BUKZ' };

export default function ResetPasswordPage() {
  return (
    <Center mih="100vh" bg="gray.0" px="md">
      <Stack w="100%" maw={420} gap="lg">
        <Stack align="center" gap={6}>
          <Anchor component={Link} href="/" fz={32} fw={800} c="primary.7" underline="never">
            BUKZ
          </Anchor>
          <Title order={1} size="h2" ta="center">
            Set a new password
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Choose a strong password for your account.
          </Text>
        </Stack>
        <ResetPasswordForm />
      </Stack>
    </Center>
  );
}
