'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MapPin, Clock, ArrowRight, Briefcase } from 'lucide-react';

export interface JobHit {
  objectID: string;
  slug: string;
  title: string;
  location: string;
  jobType: string;
  remotePolicy: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  featured?: boolean;
  createdAt?: string;
}

function formatSalary(min?: number, max?: number, currency = 'GBP'): string {
  if (!min && !max) return 'Salary not specified';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatJobType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ hit }: { hit: JobHit }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className={`group rounded-2xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-[#0D1E24] ${hit.featured ? 'border-[#2cd7f2]/30 bg-amber-50/30 dark:bg-[#071E24]' : 'border-slate-200/80 dark:border-[#183038]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {hit.featured && (
            <span className="mb-2 inline-block rounded-full bg-[#2cd7f2]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#0a7a8c] dark:text-[#a8ecf8]">
              Featured
            </span>
          )}
          <Link
            href={`/jobs/${hit.slug}`}
            className="line-clamp-2 text-base font-bold text-[#0f2a2e] transition-colors duration-200 group-hover:text-[#2cd7f2] dark:text-slate-100 dark:group-hover:text-[#2cd7f2]"
          >
            {hit.title}
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <MapPin size={12} className="shrink-0" />
            {hit.location}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-base font-bold text-[#2cd7f2]">
            {formatSalary(hit.salaryMin, hit.salaryMax, hit.salaryCurrency)}
          </span>
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? 'Unsave job' : 'Save job'}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:scale-110 ${saved ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/40' : 'border-slate-200 bg-white text-slate-400 hover:text-red-400 dark:border-[#183038] dark:bg-[#0D1E24]'}`}
          >
            <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#0f2a2e]/8 px-2.5 py-0.5 text-xs font-medium text-[#0f2a2e] dark:bg-white/8 dark:text-slate-300">
          {formatJobType(hit.jobType)}
        </span>
        {hit.remotePolicy !== 'office' && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            {hit.remotePolicy === 'remote' ? 'Remote' : 'Hybrid'}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-[#122A32] dark:text-slate-400">
          {hit.experienceLevel?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#183038]">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={11} />
          {timeAgo(hit.createdAt)}
        </div>
        <Link
          href={`/jobs/${hit.slug}`}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0f2a2e] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2]"
        >
          View job <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
