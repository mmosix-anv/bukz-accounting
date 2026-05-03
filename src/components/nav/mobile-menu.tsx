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
  { label: 'Services', href: '/services' },
  { label: 'Learn', href: '/learn' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function MobileMenu({ role }: Props) {
  const [open, setOpen] = useState(false);
  const isGuest = role === 'guest';

  return (
    <Box hiddenFrom="md">
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        radius="md"
        size="lg"
        className="border border-slate-200/70 bg-white dark:border-[#183038] dark:bg-[#171b28]"
      >
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
        classNames={{
          content: 'bg-white dark:bg-[#0A1A20]',
          header: 'border-b border-slate-200 dark:border-[#183038]',
        }}
      >
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt={4}>
            Explore
          </Text>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} component={Link} href={link.href} label={link.label} onClick={() => setOpen(false)} />
          ))}

          <Divider my="sm" />

          {isGuest ? (
            <>
              <Button component={Link} href="/auth/login" variant="default" fullWidth onClick={() => setOpen(false)}>
                Log in
              </Button>
              <Button component={Link} href="/contact" color="primary" fullWidth onClick={() => setOpen(false)}>
                Book a Call
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
