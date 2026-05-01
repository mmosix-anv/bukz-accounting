'use client';

import { useFormContext } from 'react-hook-form';
import type { PostJobFormValues } from './post-job-form';

interface Props { onNext: () => void; onBack: () => void }

const PACKAGES = [
  {
    value: 'single' as const,
    label: 'Single posting',
    price: '£199',
    priceNote: 'GBP, one-off',
    features: ['1 job listing', '30-day visibility', 'Candidate matching', 'Applicant dashboard'],
  },
  {
    value: 'triple' as const,
    label: '3-Job bundle',
    price: '£499',
    priceNote: 'GBP, save £98',
    badge: 'Best value',
    features: ['3 job listings', '30-day each', 'Priority placement', 'Candidate matching', 'Applicant dashboard'],
  },
];

export function Step4Package({ onNext, onBack }: Props) {
  const { register, watch } = useFormContext<PostJobFormValues>();
  const selected = watch('packageType');

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-primary">Choose your package</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PACKAGES.map((pkg) => (
          <label key={pkg.value} className="cursor-pointer">
            <input type="radio" value={pkg.value} {...register('packageType')} className="sr-only" />
            <div className={`relative rounded-xl border-2 p-5 transition-all ${selected === pkg.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
              {pkg.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                  {pkg.badge}
                </span>
              )}
              <p className="font-semibold text-primary">{pkg.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{pkg.price}</p>
              <p className="text-xs text-slate-500">{pkg.priceNote}</p>
              <ul className="mt-3 space-y-1.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Secure payment via Stripe. All prices include VAT where applicable. Billed in GBP.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={onNext} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">Preview listing →</button>
      </div>
    </div>
  );
}
