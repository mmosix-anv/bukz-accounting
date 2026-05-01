'use client';

import type { JobPostingPackageSetting } from '@bukz/db';
import { useFormContext } from 'react-hook-form';
import type { PostJobFormValues } from './post-job-form';

interface Props {
  packages: JobPostingPackageSetting[];
  onNext: () => void;
  onBack: () => void;
}

export function Step4Package({ packages, onNext, onBack }: Props) {
  const { register, watch } = useFormContext<PostJobFormValues>();
  const selected = watch('packageType');

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-primary">Choose your package</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {packages.map((pkg) => (
          <label key={pkg.id} className="cursor-pointer">
            <input type="radio" value={pkg.id} {...register('packageType')} className="sr-only" />
            <div className={`relative rounded-xl border-2 p-5 transition-all ${selected === pkg.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
              {pkg.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                  {pkg.badge}
                </span>
              )}
              <p className="font-semibold text-primary">{pkg.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">£{(pkg.pricePence / 100).toLocaleString('en-GB')}</p>
              <p className="text-xs text-slate-500">{pkg.priceNote}</p>
              <ul className="mt-3 space-y-1.5">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Secure payment via Stripe. All prices include VAT where applicable. Billed in GBP.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={onNext} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">Preview listing →</button>
      </div>
    </div>
  );
}