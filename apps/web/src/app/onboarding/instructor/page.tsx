import type { Metadata } from 'next';
import { InstructorOnboardingForm } from './instructor-onboarding-form';
import { Card, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Set up your instructor profile — BUKZ' };

export default function InstructorOnboardingPage() {
  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} fz="h2" c="primary.7">Set up your instructor profile</Title>
        <Text c="dimmed">
        Share your expertise with thousands of accounting professionals.
        </Text>
      </Stack>
      <Card withBorder radius="md" p="xl">
        <InstructorOnboardingForm />
      </Card>
    </Stack>
  );
}
