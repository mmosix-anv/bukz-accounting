'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialisations: string[];
  qualifications: string[];
  bio: string;
  avatarUrl: string | null;
  hourlyRateGbp: string | null;
  calUsername: string | null;
  isVerified: boolean;
}

interface Props {
  experts: Expert[];
  allSpecialisations: string[];
}

export function ExpertsDirectoryClient({ experts, allSpecialisations }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = selected
    ? experts.filter((e) => e.specialisations.includes(selected))
    : experts;

  function toggleSpec(spec: string) {
    setSelected((prev) => (prev === spec ? null : spec));
  }

  return (
    <div className="space-y-6">
      {allSpecialisations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelected(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === null
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {allSpecialisations.map((spec) => (
            <button
              key={spec}
              onClick={() => toggleSpec(spec)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selected === spec
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">No experts found for this specialisation.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
          {expert.avatarUrl ? (
            <Image src={expert.avatarUrl} alt={expert.name} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
              {expert.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold text-primary">{expert.name}</h2>
            {expert.isVerified && (
              <svg className="h-4 w-4 shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">{expert.title}</p>
        </div>
      </div>

      {expert.bio && (
        <p className="mt-3 line-clamp-3 text-sm text-slate-600">{expert.bio}</p>
      )}

      {expert.specialisations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {expert.specialisations.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {s}
            </span>
          ))}
          {expert.specialisations.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
              +{expert.specialisations.length - 4} more
            </span>
          )}
        </div>
      )}

      {expert.qualifications.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {expert.qualifications.slice(0, 3).map((q) => (
            <span key={q} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {q}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
        <span className="text-sm font-semibold text-primary">
          {expert.hourlyRateGbp ? `£${Number(expert.hourlyRateGbp).toFixed(0)}/hr` : 'POA'}
        </span>
        {expert.calUsername ? (
          <Link
            href={`/experts/${expert.calUsername}`}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Book consultation
          </Link>
        ) : (
          <span className="text-xs text-slate-400">Bookings unavailable</span>
        )}
      </div>
    </div>
  );
}
