import type { Metadata } from 'next';
import { EmployerOnboardingForm } from './employer-onboarding-form';
import { Card, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Set up your employer profile — BUKZ' };

export default function EmployerOnboardingPage() {
  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} fz="h2" c="primary.7">Set up your employer profile</Title>
        <Text c="dimmed">
        Tell candidates about your organisation to attract the right talent.
        </Text>
      </Stack>
      <Card withBorder radius="md" p="xl">
        <EmployerOnboardingForm />
      </Card>
    </Stack>
  );
}
