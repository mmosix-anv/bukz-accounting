'use client';

import { useState } from 'react';
import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
  Configure,
  RefinementList,
  SortBy,
  useInstantSearch,
} from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import { Award, BookOpen, GraduationCap, Search, SlidersHorizontal, X } from 'lucide-react';
import { CourseCard, type CourseHit } from './course-card';

const searchClient = algoliasearch(
  process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? 'placeholder',
  process.env['NEXT_PUBLIC_ALGOLIA_SEARCH_KEY'] ?? 'placeholder',
);

function EmptyState() {
  const { results } = useInstantSearch();
  if (!results || results.nbHits > 0) return null;

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#202433]">
        <GraduationCap size={24} className="text-slate-400" />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-[#0D1B3E] dark:text-white">No courses found</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Try adjusting your search or filters
      </p>
    </div>
  );
}

const refinementClasses = {
  root: 'space-y-0.5',
  item: 'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0D1B3E] dark:text-slate-400 dark:hover:bg-[#202433] dark:hover:text-slate-200',
  selectedItem: 'bg-[#C9A84C]/8 font-medium text-[#0D1B3E] dark:bg-[#C9A84C]/10 dark:text-[#E8D595]',
  checkbox: 'h-4 w-4 rounded accent-[#C9A84C] cursor-pointer',
  label: 'flex items-center gap-2 cursor-pointer flex-1 min-w-0',
  count: 'ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-[#222738] dark:text-slate-500',
};

const filterSections = [
  { label: 'Level', attr: 'level', transform: true },
  { label: 'CPD hours', attr: 'cpdHours', transform: false },
  { label: 'Price (GBP)', attr: 'priceGbp', transform: false },
] as const;

function FilterSidebar() {
  return (
    <div className="space-y-5">
      {filterSections.map(({ label, attr, transform }) => (
        <div key={attr}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <RefinementList
            attribute={attr}
            transformItems={
              transform
                ? (items) => items.map((item) => ({ ...item, label: item.label.charAt(0).toUpperCase() + item.label.slice(1) }))
                : undefined
            }
            classNames={refinementClasses}
          />
        </div>
      ))}
    </div>
  );
}

export function LearnSearch() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <InstantSearch searchClient={searchClient} indexName="bukz_learn">
      <Configure hitsPerPage={12} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/learn-hero.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <GraduationCap size={12} className="text-[#C9A84C]" />
                <span className="text-xs font-medium text-slate-300">CPD-accredited by leading bodies</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                CPD-accredited courses for ambitious finance professionals
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300/90">
                Earn recognised CPD hours for ICAEW, ACCA, CIMA and AAT with structured learning built around real practice.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#C9A84C]" /> 150+ courses
                </span>
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-[#C9A84C]" /> Verified certificates
                </span>
              </div>
            </div>
            <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-sm font-semibold text-white">Learning built for CPD progress</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3">
                  Filter by level, CPD hours, and price to find the right fit quickly.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-4 py-3">
                  Continue professional development with certificate-ready learning pathways.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-[#14151e]" />
      </div>

      {/* ── Search + Results ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-2">
          <SearchBox
            placeholder="Search CPD courses, topics or qualifications…"
            classNames={{
              root: 'flex-1',
              form: 'flex gap-2',
              input: 'flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0D1B3E] focus:outline-none focus:ring-2 focus:ring-[#0D1B3E]/10 dark:border-[#2a2d3e] dark:bg-[#1a1d2a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#C9A84C]/60',
              submit: 'rounded-xl bg-[#0D1B3E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#162850] dark:bg-[#C9A84C] dark:text-[#0D1B3E] dark:hover:bg-[#d4b75d] flex items-center gap-2',
              submitIcon: 'hidden',
              reset: 'hidden',
              loadingIndicator: 'hidden',
            }}
            submitIconComponent={() => <><Search size={15} /><span>Search</span></>}
          />
          <SortBy
            items={[
              { label: 'Newest', value: 'bukz_learn' },
              { label: 'Highest rated', value: 'bukz_learn_rating' },
              { label: 'Most enrolled', value: 'bukz_learn_enrollments' },
            ]}
            classNames={{
              root: 'shrink-0',
              select: 'h-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-[#0D1B3E] focus:outline-none dark:border-[#2a2d3e] dark:bg-[#1a1d2a] dark:text-slate-300',
            }}
          />
        </div>

        <div className="flex items-start gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-[#2a2d3e] dark:bg-[#1a1d2a]">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-[#2a2d3e]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D1B3E]/5 dark:bg-white/5">
                  <SlidersHorizontal size={13} className="text-[#0D1B3E] dark:text-slate-300" />
                </div>
                <span className="text-sm font-semibold text-[#0D1B3E] dark:text-slate-100">Filters</span>
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">CPD courses</span>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#2a2d3e] dark:bg-[#1a1d2a] dark:text-slate-300 lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            <InfiniteHits
              hitComponent={({ hit }) => <CourseCard hit={hit as unknown as CourseHit} />}
              classNames={{
                root: '',
                list: 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
                loadMore: 'mt-8 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#2a2d3e] dark:bg-[#1a1d2a] dark:text-slate-300 dark:hover:bg-[#1e2130]',
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
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col overflow-y-auto bg-white p-6 shadow-2xl dark:bg-[#14151e]">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-semibold text-[#0D1B3E] dark:text-white">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202433]"
              >
                <X size={16} />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </InstantSearch>
  );
}
