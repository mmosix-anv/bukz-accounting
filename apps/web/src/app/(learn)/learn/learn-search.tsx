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
      <p className="text-3xl">🎓</p>
      <h3 className="mt-3 font-semibold text-primary">No courses found</h3>
      <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
    </div>
  );
}

const refinementClasses = {
  root: 'space-y-1.5',
  item: 'flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-primary',
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">CPD-Accredited Courses</h1>
          <p className="mt-1 text-slate-500">
            Earn recognised CPD hours for ICAEW, ACCA, CIMA and AAT
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox
            placeholder="Search courses…"
            classNames={{
              root: 'flex-1 max-w-xl',
              form: 'flex gap-2',
              input:
                'flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              submit:
                'rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90',
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
              select: 'rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary',
            }}
          />
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  CPD Hours
                </h3>
                <RefinementList attribute="cpdHours" classNames={refinementClasses} />
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Price (GBP)
                </h3>
                <RefinementList attribute="priceGbp" classNames={refinementClasses} />
              </div>
            </div>
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative ml-auto flex h-full w-64 flex-col bg-white p-5 shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-primary">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400">✕</button>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Level</h3>
                    <RefinementList attribute="level" classNames={refinementClasses} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-primary lg:hidden"
            >
              ⚙ Filters
            </button>

            <InfiniteHits
              hitComponent={({ hit }) => <CourseCard hit={hit as unknown as CourseHit} />}
              classNames={{
                root: '',
                list: 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3',
                loadMore:
                  'mt-8 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors',
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
