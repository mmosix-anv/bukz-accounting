'use client';

export default function LearnErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Courses unavailable</h1>
        <p className="mt-2 text-slate-600">We couldn&apos;t load the course catalogue. Please try again.</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}