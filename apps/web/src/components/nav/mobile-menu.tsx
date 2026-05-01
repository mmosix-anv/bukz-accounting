'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActionIcon, Box, Button, Divider, Drawer, NavLink, Stack, Text } from '@mantine/core';
import { Menu as MenuIcon } from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';

interface Props {
  role: string;
}

const NAV_LINKS = [
  { label: 'Jobs', href: '/jobs' },
  { label: 'Learn', href: '/learn' },
  { label: 'Insight', href: '/insight' },
];

export function MobileMenu({ role }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Box hiddenFrom="md">
      <ActionIcon variant="subtle" color="primary" onClick={() => setOpen(true)} aria-label="Open menu" radius="md">
        <MenuIcon size={18} />
      </ActionIcon>

      <Drawer
        opened={open}
        onClose={() => setOpen(false)}
        position="right"
        size="sm"
        padding="md"
        title={
          <Text fw={800} c="primary">
            BUKZ
          </Text>
        }
      >
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt={4}>
            Explore
          </Text>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} component={Link} href={link.href} label={link.label} onClick={() => setOpen(false)} />
          ))}

          <Divider my="sm" />

          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Account
          </Text>
          <NavLink component={Link} href="/dashboard" label="Dashboard" onClick={() => setOpen(false)} />
          {role === 'employer' && (
            <NavLink component={Link} href="/employers/dashboard" label="Employer Portal" onClick={() => setOpen(false)} />
          )}
          {role === 'admin' && <NavLink component={Link} href="/admin" label="Admin" onClick={() => setOpen(false)} />}
          <NavLink component={Link} href="/dashboard/settings" label="Settings" onClick={() => setOpen(false)} />

          <Divider my="sm" />

          <form action={logoutAction}>
            <Button type="submit" color="red" variant="light" fullWidth>
              Sign out
            </Button>
          </form>
        </Stack>
      </Drawer>
    </Box>
  );
}
