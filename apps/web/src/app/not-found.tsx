import Link from 'next/link';
import { Button, Center, Group, Stack, Text, Title } from '@mantine/core';

export default function NotFound() {
  return (
    <Center mih="100vh" bg="gray.0" px="md" ta="center">
      <Stack align="center" gap="md">
        <Text fz={88} fw={800} c="primary.1" lh={1}>
          404
        </Text>
        <Title order={1} fz="h2" c="primary.7">
          Page not found
        </Title>
        <Text c="dimmed" maw={360}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>
        <Group gap="xs" justify="center">
          <Button component={Link} href="/">
            Go home
          </Button>
          <Button component={Link} href="/jobs" variant="default">
            Browse jobs
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
