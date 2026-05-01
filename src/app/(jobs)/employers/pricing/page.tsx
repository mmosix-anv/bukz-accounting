import type { Metadata } from 'next';
import type { EmployerSubscriptionTierId, EmployerSubscriptionTierSetting, JobPostingPackageSetting } from '@bukz/db';
import {
  getPlatformSettingDefault,
  getEmployerSubscriptionSettingKey,
  getJobPostingPackageSettingKey,
} from '@bukz/db';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PricingCheckoutButton } from './pricing-checkout-button';

export const metadata: Metadata = {
  title: 'Employer Pricing | BUKZ Jobs',
  description: 'Choose an employer subscription plan and start hiring UK accounting talent today.',
};

const PAID_TIERS: Exclude<EmployerSubscriptionTierId, 'free'>[] = ['starter', 'pro', 'enterprise'];

export default async function PricingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const token = user ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  const isEmployer = user?.user_metadata?.['role'] === 'employer' || user?.user_metadata?.['role'] === 'admin';

  const subscriptionTiers = PAID_TIERS.map((id) =>
    getPlatformSettingDefault(getEmployerSubscriptionSettingKey(id)) as EmployerSubscriptionTierSetting
  );
  const singlePosting = getPlatformSettingDefault(getJobPostingPackageSettingKey('single')) as JobPostingPackageSetting;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold text-primary">Employer plans</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
          Reach thousands of qualified UK accounting and finance professionals. All plans are billed monthly, cancel any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {subscriptionTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
              tier.highlight
                ? 'scale-[1.02] border-primary bg-primary text-white shadow-xl shadow-primary/20'
                : 'border-slate-200 bg-white'
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-white shadow">
                Most popular
              </span>
            )}

            <div className="mb-6">
              <h2 className={`text-xl font-bold ${tier.highlight ? 'text-white' : 'text-primary'}`}>{tier.label}</h2>
              <p className={`mt-1 text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-500'}`}>{tier.description}</p>
            </div>

            <div className="mb-6">
              <span className={`text-5xl font-bold ${tier.highlight ? 'text-white' : 'text-primary'}`}>
                £{(tier.priceMonthlyPence / 100).toLocaleString('en-GB')}
              </span>
              <span className={`text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-400'}`}>/month</span>
              <p className={`mt-1 text-xs ${tier.highlight ? 'text-white/60' : 'text-slate-400'}`}>excl. VAT</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? 'text-accent' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className={tier.highlight ? 'text-white/90' : 'text-slate-600'}>{feature}</span>
                </li>
              ))}
            </ul>

            {isEmployer ? (
              <PricingCheckoutButton
                tier={tier.id as Exclude<EmployerSubscriptionTierId, 'free'>}
                highlight={tier.highlight}
                token={token}
              />
            ) : (
              <Link
                href="/auth/register?role=employer&redirectTo=/employers/pricing"
                className={`block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                  tier.highlight ? 'bg-accent text-white hover:bg-accent/90' : 'bg-primary text-white hover:bg-primary/90'
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
          className="mt-4 inline-block rounded-md border border-primary px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Post a single job — from £{(singlePosting.pricePence / 100).toLocaleString('en-GB')}
        </Link>
      </div>
    </div>
  );
}
