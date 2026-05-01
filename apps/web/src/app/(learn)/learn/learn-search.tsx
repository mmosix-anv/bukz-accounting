'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { GraduationCap, BookOpen, Award } from 'lucide-react';
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
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <GraduationCap size={24} className="text-slate-400" />
      </div>
      <h3 className="mt-3 font-semibold text-primary text-lg">No courses found</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">Try adjusting your search or filters</p>
    </div>
  );
}

const refinementClasses = {
  root: 'space-y-1.5',
  item: 'flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-primary transition-colors',
  selectedItem: 'text-primary font-medium',
  checkbox: 'h-3.5 w-3.5 rounded accent-primary',
  label: 'flex items-center gap-2 cursor-pointer flex-1',
  count: 'ml-auto text-xs text-slate-400',
};

export function LearnSearch() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <InstantSearch searchClient={searchClient} indexName="bukz_learn" routing={true}>
      <Configure hitsPerPage={12} />

      {/* Hero Banner */}
      <div className="relative bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/learn-hero.svg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 line-pattern" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-5 backdrop-blur-sm">
              <GraduationCap size={12} className="text-[#C9A84C]" />
              <span className="text-xs font-medium text-slate-300">CPD-accredited by leading bodies</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              CPD-Accredited{' '}
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#E8D595] bg-clip-text text-transparent">Courses</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300/90 max-w-lg leading-relaxed">
              Earn recognised CPD hours for ICAEW, ACCA, CIMA and AAT
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#C9A84C]" />
                150+ courses
              </span>
              <span className="flex items-center gap-1.5">
                <Award size={13} className="text-[#C9A84C]" />
                Verified certificates
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox
            placeholder="Search courses…"
            classNames={{
              root: 'flex-1 max-w-xl',
              form: 'flex gap-2',
              input:
                'flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
              submit:
                'rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90 shadow-sm transition-colors',
              reset: 'hidden',
              loadingIndicator: 'hidden',
            }}
          />
          <SortBy
            items={[
              { label: 'Newest', value: 'bukz_learn' },
              { label: 'Highest rated', value: 'bukz_learn_rating' },
              { label: 'Most enrolled', value: 'bukz_learn_enrollments' },
            ]}
            classNames={{
              select: 'rounded-lg border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all',
            }}
          />
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 space-y-6 shadow-sm">
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Level
                </h3>
                <RefinementList
                  attribute="level"
                  transformItems={(items) =>
                    items.map((item) => ({
                      ...item,
                      label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
                    }))
                  }
                  classNames={refinementClasses}
                />
              </div>
              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  CPD Hours
                </h3>
                <RefinementList attribute="cpdHours" classNames={refinementClasses} />
              </div>
              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Price (GBP)
                </h3>
                <RefinementList attribute="priceGbp" classNames={refinementClasses} />
              </div>
            </div>
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative ml-auto flex h-full w-72 flex-col bg-white p-6 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-primary text-lg">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Level</h3>
                    <RefinementList attribute="level" classNames={refinementClasses} />
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">CPD Hours</h3>
                    <RefinementList attribute="cpdHours" classNames={refinementClasses} />
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Price (GBP)</h3>
                    <RefinementList attribute="priceGbp" classNames={refinementClasses} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary shadow-sm transition-all lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
              Filters
            </button>

            <InfiniteHits
              hitComponent={({ hit }) => <CourseCard hit={hit as unknown as CourseHit} />}
              classNames={{
                root: '',
                list: 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3',
                loadMore:
                  'mt-8 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-200',
                disabledLoadMore: 'hidden',
              }}
            />
            <EmptyState />
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}
