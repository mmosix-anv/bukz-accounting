'use client';

import { useFormContext } from 'react-hook-form';
import type { PostJobFormValues } from './post-job-form';

interface Props { onBack: () => void; onSubmit: () => void; isSubmitting: boolean }

function formatEnum(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Step5Preview({ onBack, onSubmit, isSubmitting }: Props) {
  const { watch } = useFormContext<PostJobFormValues>();
  const values = watch();

  const packageLabel = values.packageType === 'triple' ? '3-Job bundle — £499 GBP' : 'Single posting — £199 GBP';

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-primary">Preview your listing</h2>

      <div className="rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-primary">{values.title || '(no title)'}</h3>
          <p className="text-sm text-slate-500 mt-1">{values.location}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {values.jobType && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {formatEnum(values.jobType)}
              </span>
            )}
            {values.remotePolicy && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                {formatEnum(values.remotePolicy)}
              </span>
            )}
            {values.experienceLevel && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                {formatEnum(values.experienceLevel)}
              </span>
            )}
          </div>
        </div>

        {(values.salaryMin || values.salaryMax) && (
          <p className="font-semibold text-accent">
            {values.salaryMin && `£${Number(values.salaryMin).toLocaleString('en-GB')}`}
            {values.salaryMin && values.salaryMax && ' – '}
            {values.salaryMax && `£${Number(values.salaryMax).toLocaleString('en-GB')}`}
            {' GBP per year'}
          </p>
        )}

        {values.description && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
            <p className="text-sm text-slate-600 line-clamp-4">{values.description}</p>
          </div>
        )}

        {values.qualifications?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Qualifications</p>
            <div className="flex flex-wrap gap-1.5">
              {values.qualifications.map((q) => (
                <span key={q} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{q}</span>
              ))}
            </div>
          </div>
        )}

        {values.softwareSkills?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Software</p>
            <div className="flex flex-wrap gap-1.5">
              {values.softwareSkills.map((s) => (
                <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm font-semibold text-primary">Selected package: {packageLabel}</p>
        <p className="text-xs text-slate-500 mt-1">You will be redirected to Stripe to complete payment securely in GBP.</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
        >
          {isSubmitting ? 'Processing…' : 'Pay & Publish →'}
        </button>
      </div>
    </div>
  );
}
