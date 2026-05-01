'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

const theme = createTheme({
  fontFamily: 'Inter, system-ui, sans-serif',
  primaryColor: 'primary',
  defaultRadius: 'md',
  colors: {
    primary: [
      '#E8EBF3',
      '#C6CEDF',
      '#9FAEC8',
      '#788DB1',
      '#5A729F',
      '#3D578D',
      '#2E4278',
      '#1F2E62',
      '#0D1B3E',
      '#060D1F',
    ],
    accent: [
      '#FAF4E5',
      '#F2E5BF',
      '#E8D595',
      '#DEC46B',
      '#D4B752',
      '#C9A84C',
      '#B8943A',
      '#9A7A2C',
      '#7C611E',
      '#5E4710',
    ],
  },
});

function PostHogSetup({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => posthog);

  useEffect(() => {
    const key = process.env['NEXT_PUBLIC_POSTHOG_KEY'];
    const host = process.env['NEXT_PUBLIC_POSTHOG_HOST'] ?? 'https://eu.posthog.com';
    if (key && typeof window !== 'undefined') {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        persistence: 'localStorage+cookie',
      });
    }
  }, []);

  return <PostHogProvider client={client}>{children}</PostHogProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" limit={3} />
      <PostHogSetup>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </PostHogSetup>
    </MantineProvider>
  );
}
