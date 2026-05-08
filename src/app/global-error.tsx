'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
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
              A critical application error occurred. Please try again or go back to the home page.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => reset()}
                className="rounded-lg bg-[#0f2a2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#122e33]"
              >
                Try again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a2e] hover:bg-slate-50"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
