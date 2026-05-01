'use client';

import { useState } from 'react';
import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
  Configure,
  useInstantSearch,
} from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';
import { Button, Card, Container, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { SlidersHorizontal } from 'lucide-react';
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
      <p className="text-2xl">🔍</p>
      <h3 className="mt-3 font-semibold text-primary">No jobs found</h3>
      <p className="mt-1 text-sm text-slate-500">
        Try adjusting your search or filters
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['Management Accountant', 'Tax Advisor', 'Finance Director', 'Payroll Manager'].map((s) => (
          <button
            key={s}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors"
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

      <Container size="lg" py="xl">
        <Stack gap="lg">
          <div>
            <Title order={1} c="primary">
              Accounting &amp; Finance Jobs
            </Title>
            <Text c="dimmed" mt={6}>
              Specialist roles for ACA, ACCA, CIMA and AAT qualified professionals
            </Text>
          </div>

          <Card withBorder radius="lg" padding="md">
            <SearchBox
              placeholder="Job title, skill or keyword…"
              classNames={{
                root: 'relative',
                form: 'flex gap-2',
                input:
                  'flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                submit:
                  'rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors',
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
                    'mt-6 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors',
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
