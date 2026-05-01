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
            className="rounded-2xl border border-slate-200/70 bg-white/78 px-2.5 py-1.5 transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-[#2a2d3e] dark:bg-[#171b28] dark:hover:border-[#3a4056] dark:hover:bg-[#202433]"
          >
            <Group gap={4}>
              <Avatar color="primary" radius="xl" size={34}>
                {initials}
              </Avatar>
              <ChevronDown size={16} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)] dark:border-[#2a2d3e] dark:bg-[#181b28]">
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
          <Menu.Item component={Link} href="/dashboard" leftSection={<LayoutDashboard size={16} />} className="rounded-xl">
            Dashboard
          </Menu.Item>
          <Menu.Item component={Link} href={roleLink.href} className="rounded-xl">
            {roleLink.label}
          </Menu.Item>
          <Menu.Item component={Link} href="/dashboard/settings" leftSection={<Settings size={16} />} className="rounded-xl">
            Settings
          </Menu.Item>
          <Menu.Divider />
          <form action={logoutAction}>
            <Menu.Item color="red" component="button" type="submit" leftSection={<LogOut size={16} />} className="rounded-xl">
              Sign out
            </Menu.Item>
          </form>
        </Menu.Dropdown>
      </Menu>

      <MobileMenu role={role} />
    </Group>
  );
}
