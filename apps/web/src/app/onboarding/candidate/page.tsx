import type { Metadata } from 'next';
import { CandidateOnboardingForm } from './candidate-onboarding-form';
import { Card, Stack, Text, Title } from '@mantine/core';

export const metadata: Metadata = { title: 'Set up your candidate profile — BUKZ' };

export default function CandidateOnboardingPage() {
  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} fz="h2" c="primary.7">Set up your profile</Title>
        <Text c="dimmed">
        Help employers find you and get personalised job matches.
        </Text>
      </Stack>
      <Card withBorder radius="md" p="xl">
        <CandidateOnboardingForm />
      </Card>
    </Stack>
  );
}
