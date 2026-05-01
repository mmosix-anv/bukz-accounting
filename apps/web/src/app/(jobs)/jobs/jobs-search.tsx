'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
  Configure,
  useInstantSearch,
} from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import { Button, Card, Container, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { SlidersHorizontal, Briefcase, MapPin, TrendingUp } from 'lucide-react';
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
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <Briefcase size={24} className="text-slate-400" />
      </div>
      <h3 className="mt-3 font-semibold text-primary text-lg">No jobs found</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Try adjusting your search or filters to discover more opportunities
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['Management Accountant', 'Tax Advisor', 'Finance Director', 'Payroll Manager'].map((s) => (
          <button
            key={s}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-200"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JobsSearch() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="bukz_jobs"
      routing={true}
    >
      <Configure hitsPerPage={15} filters="status:active" />

      {/* Hero Banner */}
      <div className="relative bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jobs-hero.svg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 line-pattern" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-5 backdrop-blur-sm">
              <Briefcase size={12} className="text-[#C9A84C]" />
              <span className="text-xs font-medium text-slate-300">2,500+ specialist roles</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Accounting &amp; Finance{' '}
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#E8D595] bg-clip-text text-transparent">Jobs</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300/90 max-w-lg leading-relaxed">
              Specialist roles for ACA, ACCA, CIMA and AAT qualified professionals across the UK
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#C9A84C]" />
                UK-wide
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#C9A84C]" />
                £45k – £150k+
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
      </div>

      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Card withBorder radius="lg" padding="md" className="shadow-sm">
            <SearchBox
              placeholder="Job title, skill or keyword…"
              classNames={{
                root: 'relative',
                form: 'flex gap-2',
                input:
                  'flex-1 rounded-lg border border-slate-200 px-4 py-3.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                submit:
                  'rounded-lg bg-primary px-6 py-3.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm',
                reset: 'hidden',
                loadingIndicator: 'hidden',
              }}
            />
          </Card>

          <Group align="flex-start" gap="xl" wrap="nowrap">
            <Stack w={280} visibleFrom="lg" gap="md">
              <FilterPanel />
            </Stack>

            <Stack flex={1} gap="md" style={{ minWidth: 0 }}>
              <Group justify="space-between">
                <Button
                  variant="default"
                  leftSection={<SlidersHorizontal size={16} />}
                  onClick={() => setMobileFiltersOpen(true)}
                  hiddenFrom="lg"
                >
                  Filters
                </Button>
              </Group>

              <InfiniteHits
                hitComponent={({ hit }) => <JobCard hit={hit as unknown as JobHit} />}
                classNames={{
                  root: 'space-y-4',
                  list: 'space-y-4',
                  loadMore:
                    'mt-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-200',
                  disabledLoadMore: 'hidden',
                }}
              />

              <EmptyState />
            </Stack>
          </Group>
        </Stack>
      </Container>

      <Drawer opened={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" padding="md" hiddenFrom="lg">
        <FilterPanel />
      </Drawer>
    </InstantSearch>
  );
}
