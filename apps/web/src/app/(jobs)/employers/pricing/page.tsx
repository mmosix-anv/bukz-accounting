import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PricingCheckoutButton } from './pricing-checkout-button';

export const metadata: Metadata = {
  title: 'Employer Pricing | BUKZ Jobs',
  description: 'Choose an employer subscription plan and start hiring UK accounting talent today.',
};

const TIERS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 49,
    listings: 3,
    description: 'Perfect for small firms making occasional hires.',
    features: [
      'Up to 3 active job listings',
      'Standard search placement',
      'Applications inbox',
      'Email notifications',
      '30-day listing duration',
    ],
    highlight: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 99,
    listings: 10,
    description: 'For growing firms with regular recruitment needs.',
    features: [
      'Up to 10 active job listings',
      'Priority search placement',
      'Applications inbox',
      'Email notifications',
      'Featured listing badge',
      '60-day listing duration',
      'Candidate CV access',
    ],
    highlight: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 249,
    listings: 999,
    description: 'Unlimited hiring for large firms and recruiters.',
    features: [
      'Unlimited active listings',
      'Top search placement',
      'Dedicated account manager',
      'Bulk job import (CSV)',
      'Custom branding',
      'API access',
      'SLA support',
    ],
    highlight: false,
  },
];

export default async function PricingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const token = user ? (await supabase.auth.getSession()).data.session?.access_token : undefined;

  const isEmployer = user?.user_metadata?.['role'] === 'employer' || user?.user_metadata?.['role'] === 'admin';

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-primary">Employer plans</h1>
        <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
          Reach thousands of qualified UK accounting and finance professionals. All plans are billed monthly, cancel any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
              tier.highlight
                ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                : 'border-slate-200 bg-white'
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-white shadow">
                Most popular
              </span>
            )}

            <div className="mb-6">
              <h2 className={`text-xl font-bold ${tier.highlight ? 'text-white' : 'text-primary'}`}>{tier.name}</h2>
              <p className={`mt-1 text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-500'}`}>{tier.description}</p>
            </div>

            <div className="mb-6">
              <span className={`text-5xl font-bold ${tier.highlight ? 'text-white' : 'text-primary'}`}>£{tier.price}</span>
              <span className={`text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-400'}`}>/month</span>
              <p className={`mt-1 text-xs ${tier.highlight ? 'text-white/60' : 'text-slate-400'}`}>excl. VAT</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <svg className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? 'text-accent' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className={tier.highlight ? 'text-white/90' : 'text-slate-600'}>{f}</span>
                </li>
              ))}
            </ul>

            {isEmployer ? (
              <PricingCheckoutButton tier={tier.id} highlight={tier.highlight} token={token} />
            ) : (
              <Link
                href={`/auth/register?role=employer&redirectTo=/employers/pricing`}
                className={`block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                Get started
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-semibold text-primary">One-off job postings</p>
        <p className="mt-1 text-sm text-slate-600">
          Don&apos;t need a monthly plan? Post individual jobs without a subscription.
        </p>
        <Link
          href="/employers/post-job"
          className="mt-4 inline-block rounded-md border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          Post a single job — from £199
        </Link>
      </div>
    </div>
  );
}
