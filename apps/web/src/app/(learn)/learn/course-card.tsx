'use client';

import Link from 'next/link';
import Image from 'next/image';

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
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400 text-sm">
        {'★'.repeat(stars)}
        {'☆'.repeat(5 - stars)}
      </div>
      <span className="text-xs text-slate-500">
        {avg.toFixed(1)} ({count})
      </span>
    </div>
  );
}

const LEVEL_COLOURS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export function CourseCard({ hit }: { hit: CourseHit }) {
  const price =
    hit.priceGbp === 0
      ? 'Free'
      : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(
          hit.priceGbp,
        );

  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-primary/10 overflow-hidden">
        {hit.thumbnailUrl ? (
          <Image
            src={hit.thumbnailUrl}
            alt={hit.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl">📚</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLOURS[hit.level] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {hit.level.charAt(0).toUpperCase() + hit.level.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
            {hit.cpdHours} CPD hrs
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/learn/${hit.slug}`} className="font-semibold text-primary hover:underline leading-snug">
          {hit.title}
        </Link>

        {hit.instructorName && (
          <p className="mt-1 text-xs text-slate-500">{hit.instructorName}</p>
        )}

        {hit.shortDescription && (
          <p className="mt-2 text-xs text-slate-600 line-clamp-2">{hit.shortDescription}</p>
        )}

        <div className="mt-3">
          <StarRating avg={hit.ratingAvg} count={hit.ratingCount} />
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">{price}</p>
            <p className="text-xs text-slate-400">{hit.enrollmentsCount.toLocaleString()} enrolled</p>
          </div>
          <Link
            href={`/learn/${hit.slug}`}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}
