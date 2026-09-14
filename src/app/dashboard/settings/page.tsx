import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SettingsForm } from './settings-form';
import { Container, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Account Settings | BUKZ' };

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect('/auth/login');

  return (
    <Container size="sm" py="xl">
      <Title order={1} size="h2" mb="lg">
        Account Settings
      </Title>
      <SettingsForm user={{ name: user.name ?? '', email: user.email ?? '' }} />
    </Container>
  );
}
