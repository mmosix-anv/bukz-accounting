'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { Avatar, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { ChevronDown, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { MobileMenu } from './mobile-menu';

interface Props {
  user: User;
}

export function AuthedHeader({ user }: Props) {
  const role = (user.user_metadata?.['role'] as string) ?? 'candidate';
  const name = (user.user_metadata?.['name'] as string) ?? user.email ?? '';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLinks = {
    candidate: { label: 'My Applications', href: '/dashboard/applications' },
    employer: { label: 'Employer Portal', href: '/employers/dashboard' },
    instructor: { label: 'My Courses', href: '/dashboard/learn' },
    admin: { label: 'Admin Panel', href: '/admin' },
  };

  const roleLink = roleLinks[role as keyof typeof roleLinks] ?? roleLinks.candidate;

  return (
    <Group gap="sm" wrap="nowrap">
      <NotificationBell />

      <Menu position="bottom-end" shadow="md" width={240} withinPortal>
        <Menu.Target>
          <UnstyledButton
            type="button"
            aria-label="Open user menu"
          >
            <Group gap={4}>
              <Avatar color="primary" radius="xl" size={34}>
                {initials}
              </Avatar>
              <ChevronDown size={16} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Group gap="sm" px="sm" py="xs" wrap="nowrap">
            <Avatar color="primary" radius="xl">
              {initials}
            </Avatar>
            <Box miw={0}>
              <Text size="sm" fw={600} c="primary" truncate>
                {name}
              </Text>
              <Text size="xs" c="dimmed" tt="capitalize">
                {role}
              </Text>
            </Box>
          </Group>
          <Menu.Divider />
          <Menu.Item component={Link} href="/dashboard" leftSection={<LayoutDashboard size={16} />}>
            Dashboard
          </Menu.Item>
          <Menu.Item component={Link} href={roleLink.href}>
            {roleLink.label}
          </Menu.Item>
          <Menu.Item component={Link} href="/dashboard/settings" leftSection={<Settings size={16} />}>
            Settings
          </Menu.Item>
          <Menu.Divider />
          <form action={logoutAction}>
            <Menu.Item color="red" component="button" type="submit" leftSection={<LogOut size={16} />}>
              Sign out
            </Menu.Item>
          </form>
        </Menu.Dropdown>
      </Menu>

      <MobileMenu role={role} />
    </Group>
  );
}
