'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Star } from 'lucide-react';

export interface CourseHit {
  objectID: string;
  slug: string;
  title: string;
  shortDescription?: string;
  instructorName?: string;
  level: string;
  priceGbp: number;
  cpdHours: number;
  enrollmentsCount: number;
  ratingAvg?: number;
  ratingCount?: number;
  thumbnailUrl?: string;
}

function StarRating({ avg, count }: { avg?: number; count?: number }) {
  if (!avg) return <span className="text-xs text-slate-400 dark:text-slate-500">No reviews yet</span>;
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < full ? 'fill-[#C9A84C] text-[#C9A84C]' : i === full && half ? 'fill-[#C9A84C]/50 text-[#C9A84C]' : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600'}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {avg.toFixed(1)} <span className="font-normal">({count})</span>
      </span>
    </div>
  );
}

const LEVEL_CONFIG: Record<string, { light: string; dark: string }> = {
  beginner: { light: 'bg-emerald-50 text-emerald-700 border-emerald-200', dark: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50' },
  intermediate: { light: 'bg-amber-50 text-amber-700 border-amber-200', dark: 'dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50' },
  advanced: { light: 'bg-rose-50 text-rose-700 border-rose-200', dark: 'dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50' },
};

export function CourseCard({ hit }: { hit: CourseHit }) {
  const price =
    hit.priceGbp === 0
      ? 'Free'
      : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(hit.priceGbp);

  const levelCfg = LEVEL_CONFIG[hit.level] ?? { light: 'bg-slate-50 text-slate-600 border-slate-200', dark: 'dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700' };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-[#2a2d3e] dark:bg-[#1a1d2a] dark:hover:border-[#3a3d52] dark:hover:shadow-2xl dark:hover:shadow-black/40">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#0D1B3E]/50">
        {hit.thumbnailUrl ? (
          <Image
            src={hit.thumbnailUrl}
            alt={hit.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-[#1a1d2a]/80">
              <BookOpen size={26} className="text-[#0D1B3E]/50 dark:text-slate-400" />
            </div>
          </div>
        )}

        {/* Level badge */}
        <div className="absolute left-3 top-3">
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelCfg.light} ${levelCfg.dark}`}>
            {hit.level.charAt(0).toUpperCase() + hit.level.slice(1)}
          </span>
        </div>

        {/* CPD badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0D1B3E]/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {hit.cpdHours} CPD hrs
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/learn/${hit.slug}`}
          className="line-clamp-2 font-semibold leading-snug text-[#0D1B3E] transition-colors duration-200 hover:text-[#C9A84C] dark:text-slate-100 dark:hover:text-[#C9A84C]"
        >
          {hit.title}
        </Link>

        {hit.instructorName && (
          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{hit.instructorName}</p>
        )}

        {hit.shortDescription && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hit.shortDescription}</p>
        )}

        <div className="mt-3">
          <StarRating avg={hit.ratingAvg} count={hit.ratingCount} />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-[#2a2d3e]">
          <div>
            <p className="text-lg font-bold text-[#0D1B3E] dark:text-white">{price}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Users size={10} />
              {hit.enrollmentsCount.toLocaleString()} enrolled
            </p>
          </div>
          <Link
            href={`/learn/${hit.slug}`}
            className="rounded-xl bg-[#0D1B3E] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0D1B3E]/90 hover:shadow-md dark:bg-[#C9A84C] dark:text-[#0D1B3E] dark:hover:bg-[#d4b75d]"
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}
