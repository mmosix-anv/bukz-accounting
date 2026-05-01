'use client';

import { Anchor, Box, Button, Group, Paper, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

const CONSENT_KEY = 'bukz_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
    else if (stored === 'accepted') posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Box pos="fixed" bottom={0} left={0} right={0} p="md" style={{ zIndex: 50 }}>
      <Paper withBorder shadow="md" radius="lg" p="md">
        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <Text size="sm" c="dimmed" maw={760}>
            We use cookies to improve your experience and understand how the platform is used. Analytics cookies are only
            set with your consent.{' '}
            <Anchor href="/privacy" c="accent" underline="always">
              Privacy Policy
            </Anchor>
          </Text>
          <Group gap="sm" justify="flex-end">
            <Button variant="default" onClick={decline}>
              Decline
            </Button>
            <Button color="primary" onClick={accept}>
              Accept cookies
            </Button>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}
