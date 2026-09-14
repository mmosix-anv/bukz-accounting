'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Props {
  tier: 'starter' | 'pro' | 'enterprise';
  highlight: boolean;
}

export function PricingCheckoutButton({ tier, highlight }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true); setError(null);
    try {
      const { url } = await apiFetch<{ url: string }>('/payments/employer-subscription-checkout', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
      if (url) window.location.href = url;
    } catch {
      setError('Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={checkout}
        disabled={loading}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          highlight
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {loading ? 'Redirecting…' : 'Subscribe now'}
      </button>
      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
