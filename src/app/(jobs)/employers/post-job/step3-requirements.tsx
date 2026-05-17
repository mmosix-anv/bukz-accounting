'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { PostJobFormValues } from './post-job-form';

const QUALIFICATIONS = ['ACA', 'ACCA', 'CIMA', 'AAT', 'CTA', 'ATT', 'ICAEW', 'CIPFA'];
const SOFTWARE = ['Xero', 'Sage', 'QuickBooks', 'IRIS', 'CCH', 'FreeAgent', 'Excel Advanced', 'Power BI'];

interface Props { onNext: () => void; onBack: () => void }

export function Step3Requirements({ onNext, onBack }: Props) {
  const { register, setValue, watch, trigger, formState: { errors } } = useFormContext<PostJobFormValues>();
  const [quals, setQuals] = useState<string[]>(watch('qualifications') ?? []);
  const [skills, setSkills] = useState<string[]>(watch('softwareSkills') ?? []);

  function toggleQual(q: string) {
    const next = quals.includes(q) ? quals.filter((x) => x !== q) : [...quals, q];
    setQuals(next); setValue('qualifications', next);
  }

  function toggleSkill(s: string) {
    const next = skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s];
    setSkills(next); setValue('softwareSkills', next);
  }

  async function handleNext() {
    const ok = await trigger(['salaryMin', 'salaryMax', 'location', 'remotePolicy']);
    if (ok) onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Preferred qualifications</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALIFICATIONS.map((q) => (
            <button key={q} type="button" onClick={() => toggleQual(q)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${quals.includes(q) ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Software skills</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SOFTWARE.map((s) => (
            <button key={s} type="button" onClick={() => toggleSkill(s)}
              className={`rounded-lg border py-2 text-xs font-medium transition-colors ${skills.includes(s) ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Min salary (£ GBP)</label>
          <input type="number" placeholder="30000" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...register('salaryMin')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Max salary (£ GBP)</label>
          <input type="number" placeholder="60000" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...register('salaryMax')} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="location">Location *</label>
        <input id="location" type="text" placeholder="London, Manchester, Remote…"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          {...register('location')} />
        {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Remote policy *</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ value: 'office', label: 'Office' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'remote', label: 'Remote' }].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" value={opt.value} {...register('remotePolicy')} className="sr-only" />
              <span className="block rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-center text-slate-700 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={handleNext} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">Continue →</button>
      </div>
    </div>
  );
}
