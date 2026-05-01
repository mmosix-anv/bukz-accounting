import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | BUKZ Accounting',
    default: 'BUKZ Accounting — Jobs, Learning & Insight for Finance Professionals',
  },
  description:
    'The UK\'s specialist platform for accounting & finance professionals. Find jobs, gain CPD-accredited qualifications, and access expert insight.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
