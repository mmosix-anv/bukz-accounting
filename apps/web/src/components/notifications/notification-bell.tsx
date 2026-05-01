'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { Bell } from 'lucide-react';
import { useMarkAllRead, useMarkRead, useNotifications } from '@/lib/hooks/use-notifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function handleNotificationClick(id: string, link: string | null) {
    markRead.mutate(id);
    setOpen(false);
    if (link) window.location.href = link;
  }

  return (
    <Popover opened={open} onChange={setOpen} position="bottom-end" shadow="lg" width={320} withinPortal>
      <Popover.Target>
        <Indicator
          inline
          disabled={unreadCount === 0}
          label={unreadCount > 9 ? '9+' : unreadCount}
          size={16}
          color="red"
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            size="lg"
            onClick={() => setOpen((current) => !current)}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify="space-between" px="md" py="sm">
          <Text size="sm" fw={700} c="primary.8">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button variant="subtle" size="compact-xs" onClick={() => markAllRead.mutate()}>
              Mark all read
            </Button>
          )}
        </Group>
        <Divider />

        <ScrollArea.Autosize mah={320}>
          {notifications.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" px="md" py="xl">
              No notifications yet
            </Text>
          ) : (
            <Stack gap={0}>
              {notifications.slice(0, 10).map((notification) => (
                <UnstyledButton
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  p="md"
                  bg={notification.read ? undefined : 'primary.0'}
                >
                  <Group align="flex-start" gap="sm" wrap="nowrap">
                    {!notification.read && <ThemeIcon mt={7} size={8} radius="xl" color="primary" />}
                    <Stack gap={2} flex={1} ml={notification.read ? 20 : 0}>
                      <Text size="sm" fw={600} c="gray.8">
                        {notification.title}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.body}
                      </Text>
                      <Text size="xs" c="gray.5">
                        {timeAgo(notification.createdAt)}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        <Divider />
        <Box px="md" py="xs">
          <Anchor
            component={Link}
            href="/dashboard"
            onClick={() => setOpen(false)}
            size="xs"
            fw={700}
            ta="center"
            display="block"
          >
            View all in dashboard
          </Anchor>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
