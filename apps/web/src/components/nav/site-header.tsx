import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AuthedHeader } from './authed-header';
import { GuestHeader } from './guest-header';
import { Anchor, Box, Container, Group, Text } from '@mantine/core';

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Box component="header" pos="sticky" top={0} bg="white" style={{ zIndex: 50 }} bd="0 0 1px solid var(--mantine-color-gray-2)">
      <Container size="xl">
        <Group h={64} justify="space-between" wrap="nowrap">
          <Group gap="xl" wrap="nowrap">
            <Anchor component={Link} href="/" underline="never">
              <Group gap={6} wrap="nowrap">
                <Text fz={26} fw={800} c="primary.8" lh={1}>
                  BUKZ
                </Text>
                <Text size="xs" fw={700} c="accent.6" visibleFrom="sm">
                  ACCOUNTING
                </Text>
              </Group>
            </Anchor>
            <Group component="nav" gap="lg" visibleFrom="md">
              <Anchor component={Link} href="/jobs" size="sm" fw={600} c="dimmed">
              Jobs
              </Anchor>
              <Anchor component={Link} href="/learn" size="sm" fw={600} c="dimmed">
              Learn
              </Anchor>
              <Anchor component={Link} href="/insight" size="sm" fw={600} c="dimmed">
              Insight
              </Anchor>
            </Group>
          </Group>

          {user ? <AuthedHeader user={user} /> : <GuestHeader />}
        </Group>
      </Container>
    </Box>
  );
}
