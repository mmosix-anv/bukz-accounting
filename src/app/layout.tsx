import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });

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
    <html lang="en" suppressHydrationWarning data-mantine-color-scheme="light">
      <head>
        <ColorSchemeScript defaultColorScheme="light" forceColorScheme="light" />
      </head>
      <body className={`${manrope.className} ${manrope.variable} ${fraunces.variable}`}>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
