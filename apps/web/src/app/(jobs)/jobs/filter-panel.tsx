'use client';

import { Card, Divider, Stack, Text } from '@mantine/core';
import { RefinementList, RangeInput, ToggleRefinement } from 'react-instantsearch';

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {title}
      </Text>
      {children}
      <Divider my={4} />
    </Stack>
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

export function FilterPanel() {
  return (
    <Card withBorder radius="lg" padding="md">
      <Text fw={700} c="primary" mb="sm">
        Filter jobs
      </Text>

      <FilterSection title="Job type">
        <RefinementList
          attribute="jobType"
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label: item.label
                .replace('full_time', 'Full time')
                .replace('part_time', 'Part time')
                .replace('contract', 'Contract')
                .replace('interim', 'Interim')
                .replace('graduate', 'Graduate'),
            }))
          }
          classNames={refinementClasses}
        />
      </FilterSection>

      <FilterSection title="Experience level">
        <RefinementList
          attribute="experienceLevel"
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label: item.label
                .replace('entry', 'Entry level')
                .replace('mid', 'Mid level')
                .replace('senior', 'Senior')
                .replace('director', 'Director')
                .replace('cfo', 'CFO / FD'),
            }))
          }
          classNames={refinementClasses}
        />
      </FilterSection>

      <FilterSection title="Remote policy">
        <RefinementList
          attribute="remotePolicy"
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label:
                item.label.charAt(0).toUpperCase() + item.label.slice(1),
            }))
          }
          classNames={refinementClasses}
        />
      </FilterSection>

      <FilterSection title="Salary range (GBP)">
        <RangeInput
          attribute="salaryMin"
          classNames={{
            root: 'flex items-center gap-2',
            input:
              'w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-primary focus:outline-none',
            separator: 'text-slate-400 text-xs',
            submit:
              'rounded bg-primary px-2 py-1.5 text-xs font-medium text-white hover:bg-primary/90',
          }}
        />
      </FilterSection>

      <FilterSection title="Remote only">
        <ToggleRefinement
          attribute="remotePolicy"
          on="remote"
          classNames={{
            root: 'flex items-center gap-2 text-sm text-slate-600',
            checkbox: 'h-4 w-4 accent-primary',
            label: 'cursor-pointer',
          }}
          label="Remote only"
        />
      </FilterSection>
    </Card>
  );
}
