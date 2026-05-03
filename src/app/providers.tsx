'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const theme = createTheme({
  fontFamily: 'var(--font-sans), system-ui, sans-serif',
  primaryColor: 'primary',
  defaultRadius: 'md',
  colors: {
    primary: [
      '#E8F3F4',
      '#C5E0E3',
      '#9CCDD1',
      '#71B8BF',
      '#48A4AE',
      '#278E98',
      '#1A7380',
      '#0F5560',
      '#0f2a2e',
      '#030F12',
    ],
    accent: [
      '#E6FAFB',
      '#B3F0F5',
      '#7AE5ED',
      '#3DD9E5',
      '#00CEDA',
      '#2cd7f2',
      '#00A8B8',
      '#008A98',
      '#006C78',
      '#004E58',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

function PostHogSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env['NEXT_PUBLIC_POSTHOG_KEY'];
    const host = process.env['NEXT_PUBLIC_POSTHOG_HOST'] ?? 'https://eu.posthog.com';
    if (!key) return;
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(key, { api_host: host, capture_pageview: false, persistence: 'localStorage+cookie' });
    });
  }, []);

  return <>{children}</>;
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
      <QueryClientProvider client={queryClient}>
        <PostHogSetup>{children}</PostHogSetup>
      </QueryClientProvider>
    </MantineProvider>
  );
}
