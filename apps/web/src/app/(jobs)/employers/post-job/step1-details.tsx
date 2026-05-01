'use client';

import { useFormContext } from 'react-hook-form';
import type { PostJobFormValues } from './post-job-form';

interface Props { onNext: () => void }

export function Step1Details({ onNext }: Props) {
  const { register, formState: { errors }, trigger } = useFormContext<PostJobFormValues>();

  async function handleNext() {
    const ok = await trigger(['title', 'jobType', 'experienceLevel']);
    if (ok) onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="title">Job title *</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Senior Management Accountant"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          {...register('title')}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Job type *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: 'full_time', label: 'Full time' },
            { value: 'part_time', label: 'Part time' },
            { value: 'contract', label: 'Contract' },
            { value: 'interim', label: 'Interim' },
            { value: 'graduate', label: 'Graduate' },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" value={opt.value} {...register('jobType')} className="sr-only" />
              <span className="block rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-center text-slate-700 hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Experience level *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { value: 'entry', label: 'Entry level' },
            { value: 'mid', label: 'Mid level' },
            { value: 'senior', label: 'Senior' },
            { value: 'director', label: 'Director' },
            { value: 'cfo', label: 'CFO / FD' },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" value={opt.value} {...register('experienceLevel')} className="sr-only" />
              <span className="block rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-center text-slate-700 hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        Continue →
      </button>
    </div>
  );
}
