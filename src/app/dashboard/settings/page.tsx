import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from './settings-form';
import { Container, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Account Settings | BUKZ' };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <Container size="sm" py="xl">
      <Title order={1} size="h2" mb="lg">
        Account Settings
      </Title>
      <SettingsForm user={{ name: user.user_metadata?.['name'] as string ?? '', email: user.email ?? '' }} />
    </Container>
  );
}
