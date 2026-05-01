'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Clock } from 'lucide-react';

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
  if (!avg) return <span className="text-xs text-slate-400">No reviews yet</span>;
  const stars = Math.round(avg);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex text-[#C9A84C] text-sm">
        {'★'.repeat(stars)}
        {'☆'.repeat(5 - stars)}
      </div>
      <span className="text-xs text-slate-500 font-medium">
        {avg.toFixed(1)} ({count})
      </span>
    </div>
  );
}

const LEVEL_COLOURS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function CourseCard({ hit }: { hit: CourseHit }) {
  const price =
    hit.priceGbp === 0
      ? 'Free'
      : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(
          hit.priceGbp,
        );

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        {hit.thumbnailUrl ? (
          <Image
            src={hit.thumbnailUrl}
            alt={hit.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              <BookOpen size={28} className="text-primary/60" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${LEVEL_COLOURS[hit.level] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}
          >
            {hit.level.charAt(0).toUpperCase() + hit.level.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-primary/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Clock size={10} />
            {hit.cpdHours} CPD hrs
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/learn/${hit.slug}`} className="font-semibold text-primary hover:text-[#C9A84C] transition-colors leading-snug line-clamp-2">
          {hit.title}
        </Link>

        {hit.instructorName && (
          <p className="mt-1.5 text-xs text-slate-500 font-medium">{hit.instructorName}</p>
        )}

        {hit.shortDescription && (
          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{hit.shortDescription}</p>
        )}

        <div className="mt-3">
          <StarRating avg={hit.ratingAvg} count={hit.ratingCount} />
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
          <div>
            <p className="text-lg font-bold text-primary">{price}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={10} />
              {hit.enrollmentsCount.toLocaleString()} enrolled
            </p>
          </div>
          <Link
            href={`/learn/${hit.slug}`}
            className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}
