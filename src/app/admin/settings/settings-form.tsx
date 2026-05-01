'use client';

import { useState } from 'react';
import type {
  EmployerSubscriptionTierSetting,
  JobPostingPackageSetting,
} from '@bukz/db';
import { apiFetch } from '@/lib/api';

interface Props {
  initialEmployerSubscriptionTiers: EmployerSubscriptionTierSetting[];
  initialJobPostingPackages: JobPostingPackageSetting[];
  token: string;
}

export function SettingsForm({
  initialEmployerSubscriptionTiers,
  initialJobPostingPackages,
  token,
}: Props) {
  const [employerSubscriptionTiers, setEmployerSubscriptionTiers] = useState(initialEmployerSubscriptionTiers);
  const [jobPostingPackages, setJobPostingPackages] = useState(initialJobPostingPackages);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateTier(
    tierId: EmployerSubscriptionTierSetting['id'],
    field: keyof EmployerSubscriptionTierSetting,
    value: string | number | boolean,
  ) {
    setEmployerSubscriptionTiers((current) =>
      current.map((tier) => (tier.id === tierId ? { ...tier, [field]: value } : tier)),
    );
  }

  function updatePackage(
    packageId: JobPostingPackageSetting['id'],
    field: keyof JobPostingPackageSetting,
    value: string | number,
  ) {
    setJobPostingPackages((current) =>
      current.map((pkg) => (pkg.id === packageId ? { ...pkg, [field]: value } : pkg)),
    );
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<{
        employerSubscriptionTiers: EmployerSubscriptionTierSetting[];
        jobPostingPackages: JobPostingPackageSetting[];
      }>('/admin/settings', {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          employerSubscriptionTiers,
          jobPostingPackages,
        }),
      });

      setEmployerSubscriptionTiers(response.employerSubscriptionTiers);
      setJobPostingPackages(response.jobPostingPackages);

      await fetch('/api/admin/settings/revalidate', { method: 'POST' });

      setMessage('Settings saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary">Employer subscription tiers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Control pricing, listing limits, and marketing copy shown to employers.
          </p>
        </div>

        <div className="space-y-6">
          {employerSubscriptionTiers.map((tier) => (
            <div key={tier.id} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Label</span>
                  <input
                    value={tier.label}
                    onChange={(event) => updateTier(tier.id, 'label', event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Monthly price (£)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(tier.priceMonthlyPence / 100).toFixed(2)}
                    onChange={(event) => updateTier(tier.id, 'priceMonthlyPence', Math.round(Number(event.target.value || 0) * 100))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Active listing limit</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tier.listings}
                    onChange={(event) => updateTier(tier.id, 'listings', Number(event.target.value || 1))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={tier.highlight}
                    onChange={(event) => updateTier(tier.id, 'highlight', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Highlight on pricing page
                </label>
              </div>

              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Description</span>
                <textarea
                  value={tier.description}
                  onChange={(event) => updateTier(tier.id, 'description', event.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary">Job posting packages</h2>
          <p className="mt-1 text-sm text-slate-500">
            Control one-off and recurring job package pricing.
          </p>
        </div>

        <div className="space-y-6">
          {jobPostingPackages.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Label</span>
                  <input
                    value={pkg.label}
                    onChange={(event) => updatePackage(pkg.id, 'label', event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Price (£)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(pkg.pricePence / 100).toFixed(2)}
                    onChange={(event) => updatePackage(pkg.id, 'pricePence', Math.round(Number(event.target.value || 0) * 100))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Price note</span>
                  <input
                    value={pkg.priceNote}
                    onChange={(event) => updatePackage(pkg.id, 'priceNote', event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Listing count</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={pkg.listingCount}
                    onChange={(event) => updatePackage(pkg.id, 'listingCount', Number(event.target.value || 1))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}