import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Button, Container, Paper, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Verify your email | BUKZ' };

export default function VerifyEmailPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email;

  return (
    <Container size="xs" py={80}>
      <Paper withBorder radius="md" p="xl">
        <Stack gap="md" align="center" ta="center">
          <Title order={1} fz="h2" c="primary.7">
            Verify your email
          </Title>
          <Text c="dimmed">
            We sent a verification link{email ? ` to ${email}` : ''}. Open it to finish setting up your account.
          </Text>
          <Button component={Link} href="/auth/login" fullWidth>
            Back to login
          </Button>
          <Text size="sm" c="dimmed">
            Wrong email? <Anchor component={Link} href="/auth/register">Create a new account</Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
