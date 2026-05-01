'use client';

import { useState } from 'react';

interface Props {
  tier: 'starter' | 'pro' | 'enterprise';
  highlight: boolean;
  token?: string;
}

export function PricingCheckoutButton({ tier, highlight, token }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    if (!token) { window.location.href = '/auth/login?redirectTo=/employers/pricing'; return; }
    setLoading(true); setError(null);
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/payments/employer-subscription-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tier }),
    });
    if (!res.ok) { setError('Could not start checkout. Please try again.'); setLoading(false); return; }
    const { url } = await res.json() as { url: string };
    if (url) window.location.href = url;
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
