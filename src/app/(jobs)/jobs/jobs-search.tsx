'use client';

import { useState } from 'react';
import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
  Configure,
  useInstantSearch,
} from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { SlidersHorizontal, Briefcase, MapPin, TrendingUp, Search, X } from 'lucide-react';
import { JobCard, type JobHit } from './job-card';
import { FilterPanel } from './filter-panel';

const searchClient = algoliasearch(
  process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? 'placeholder',
  process.env['NEXT_PUBLIC_ALGOLIA_SEARCH_KEY'] ?? 'placeholder',
);

function EmptyState() {
  const { results } = useInstantSearch();
  if (!results || results.nbHits > 0) return null;

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#0B2430]">
        <Briefcase size={24} className="text-slate-400" />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-[#0f2a2e] dark:text-white">No jobs found</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Try adjusting your search or filters to discover more opportunities
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['Management Accountant', 'Tax Advisor', 'Finance Director', 'Payroll Manager'].map((item) => (
          <button
            key={item}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition-all hover:border-[#0f2a2e] hover:text-[#0f2a2e] dark:border-[#183038] dark:bg-[#0D1E24] dark:text-slate-300"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JobsSearch() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <InstantSearch searchClient={searchClient} indexName="bukz_jobs">
      <Configure hitsPerPage={15} filters="status:active" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/jobs-hero.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <Briefcase size={12} className="text-[#2cd7f2]" />
                <span className="text-xs font-medium text-slate-300">2,500+ specialist roles</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Accounting &amp; Finance Jobs
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300/90">
                Specialist roles for ACA, ACCA, CIMA and AAT qualified professionals across the UK
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#2cd7f2]" /> UK-wide
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-[#2cd7f2]" /> £45k – £150k+
                </span>
              </div>
            </div>
            <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-sm font-semibold text-white">Search built for finance specialists</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3">
                  Filter by qualification, remote policy, salary, and seniority.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3">
                  Discover hybrid and remote openings faster with live refinements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Results ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <SearchBox
            placeholder="Job title, skill, qualification or keyword…"
            classNames={{
              root: 'relative',
              form: 'flex gap-2',
              input: 'flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f2a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2a2e]/10 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#2cd7f2]/60',
              submit: 'rounded-xl bg-[#0f2a2e] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2] flex items-center gap-2',
              submitIcon: 'hidden',
              reset: 'hidden',
              loadingIndicator: 'hidden',
            }}
            submitIconComponent={() => <><Search size={15} /><span>Search</span></>}
          />
        </div>

        <div className="flex items-start gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Accounting &amp; finance roles across the UK</span>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-300 lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            <InfiniteHits
              hitComponent={({ hit }) => <JobCard hit={hit as unknown as JobHit} />}
              classNames={{
                root: 'space-y-3',
                list: 'space-y-3',
                loadMore: 'mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#183038] dark:bg-[#0F2228] dark:text-slate-300 dark:hover:bg-[#102830]',
                disabledLoadMore: 'hidden',
              }}
            />
            <EmptyState />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col overflow-y-auto bg-white p-6 shadow-2xl dark:bg-[#0A1A20]">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-semibold text-[#0f2a2e] dark:text-white">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0B2430]"
              >
                <X size={16} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </InstantSearch>
  );
}
