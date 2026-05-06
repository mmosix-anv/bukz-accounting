'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@bukz/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-base text-gray-500">
              A critical application error occurred. Our team has been notified and is looking into it.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button onClick={() => reset()} variant="default">
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
