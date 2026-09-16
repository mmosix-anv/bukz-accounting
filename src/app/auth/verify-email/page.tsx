import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { resendVerificationAction } from '@/lib/auth-actions';

export const metadata: Metadata = { title: 'Verify your email | BUKZ' };

export default function VerifyEmailPage({ searchParams }: { searchParams: { email?: string; error?: string; resent?: string } }) {
  const email = searchParams.email;
  const invalidToken = searchParams.error === 'invalid_token';
  const resent = searchParams.resent === '1';

  return (
    <Container size="xs" py={80}>
      <Paper withBorder radius="md" p="xl">
        <Stack gap="md" align="center" ta="center">
          <Title order={1} fz="h2" c="primary.7">
            Verify your email
          </Title>
          <Text c="dimmed">
            {invalidToken
              ? 'This verification link is invalid or has expired. Request a new one below.'
              : `We sent a verification link${email ? ` to ${email}` : ''}. Open it to finish setting up your account.`}
          </Text>
          {resent && (
            <Text size="sm" c="green">
              If that account exists and isn&apos;t verified yet, a new email is on its way.
            </Text>
          )}
          {email && (
            <form action={resendVerificationAction.bind(null, email)} className="w-full">
              <Button type="submit" variant="light" fullWidth>
                Resend verification email
              </Button>
            </form>
          )}
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
