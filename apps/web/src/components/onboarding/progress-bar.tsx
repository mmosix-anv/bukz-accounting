import { Group, Progress, Stack, Text } from '@mantine/core';

interface Props {
  current: number;
  total: number;
  steps: string[];
}

export function OnboardingProgress({ current, total, steps }: Props) {
  return (
    <Stack gap="sm" mb="xl">
      <Group justify="space-between">
        <Text size="sm" fw={600} c="primary.7">
          Step {current} of {total}
        </Text>
        <Text size="sm" c="dimmed">{steps[current - 1]}</Text>
      </Group>
      <Progress value={(current / total) * 100} color="accent" radius="xl" size="sm" />
      <Group gap="xs" grow>
        {steps.map((step, i) => (
          <Text
            key={step}
            ta="center"
            size="xs"
            fw={600}
            c={i + 1 < current ? 'accent' : i + 1 === current ? 'primary.7' : 'dimmed'}
          >
            {step}
          </Text>
        ))}
      </Group>
    </Stack>
  );
}
