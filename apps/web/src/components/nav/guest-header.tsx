import Link from 'next/link';
import { Button, Group } from '@mantine/core';

export function GuestHeader() {
  return (
    <Group gap="xs">
      <Button
        component={Link}
        href="/auth/login"
        variant="subtle"
        color="gray"
      >
        Log in
      </Button>
      <Button
        component={Link}
        href="/auth/register"
        color="primary"
      >
        Get started
      </Button>
    </Group>
  );
}
