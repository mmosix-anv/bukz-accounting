'use client';

import { useEffect } from 'react';

interface Props {
  calUsername: string;
  expertName: string;
  variant?: 'sidebar' | 'cta';
}

type CalFn = ((...args: unknown[]) => void) & { q: unknown[] };

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

export function CalEmbed({ calUsername, expertName, variant = 'sidebar' }: Props) {
  const namespace = `expert-${calUsername}`;

  useEffect(() => {
    if (window.Cal) return;

    const cal: CalFn = Object.assign((...args: unknown[]) => { cal.q.push(args); }, { q: [] as unknown[] });
    window.Cal = cal;

    const s = document.createElement('script');
    s.src = 'https://app.cal.com/embed/embed.js';
    s.async = true;
    document.head.appendChild(s);

    window.Cal('init', namespace, { origin: 'https://app.cal.com' });
    window.Cal(namespace, 'ui', { styles: { branding: { brandColor: '#0D1B3E' } } });
  }, [namespace]);

  if (variant === 'cta') {
    return (
      <button
        data-cal-namespace={namespace}
        data-cal-link={calUsername}
        data-cal-config='{"layout":"month_view"}'
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        Book a session with {expertName.split(' ')[0]}
      </button>
    );
  }

  return (
    <button
      data-cal-namespace={namespace}
      data-cal-link={calUsername}
      data-cal-config='{"layout":"month_view"}'
      className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
    >
      Book consultation
    </button>
  );
}
