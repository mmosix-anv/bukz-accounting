import Link from 'next/link';
import { Anchor, AppShell, Container, Group, Text } from '@mantine/core';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 64 }} bg="gray.0">
      <AppShell.Header>
        <Container size="sm" h="100%">
          <Group h="100%" justify="space-between">
          <Anchor component={Link} href="/" fz="xl" fw={800} c="primary.7" underline="never">
            BUKZ
          </Anchor>
          <Text size="sm" c="dimmed">Setting up your account</Text>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="sm" py="xl">{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
