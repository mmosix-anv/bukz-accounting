'use client';

import { Divider, Stack, Text } from '@mantine/core';
import { SlidersHorizontal } from 'lucide-react';
import { RefinementList, RangeInput, ToggleRefinement } from 'react-instantsearch';

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap={8}>
      <Text size="xs" fw={600} c="dimmed" className="tracking-wide">
        {title}
      </Text>
      {children}
      <Divider my={4} />
    </Stack>
  );
}

const refinementClasses = {
  root: 'space-y-0.5',
  item: 'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors cursor-pointer hover:bg-slate-50 hover:text-[#0D1B3E] dark:text-slate-400 dark:hover:bg-[#202433] dark:hover:text-slate-200',
  selectedItem: 'bg-[#C9A84C]/8 font-medium text-[#0D1B3E] dark:bg-[#C9A84C]/10 dark:text-[#E8D595]',
  checkbox: 'h-4 w-4 rounded accent-[#C9A84C] cursor-pointer',
  label: 'flex items-center gap-2 cursor-pointer flex-1 min-w-0',
  count: 'ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-[#222738] dark:text-slate-500',
};

export function FilterPanel() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-[#2a2d3e] dark:bg-[#1a1d2a]">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#2a2d3e]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D1B3E]/6 dark:bg-white/6">
            <SlidersHorizontal size={13} className="text-[#0D1B3E] dark:text-slate-300" />
          </div>
          <span className="text-sm font-semibold text-[#0D1B3E] dark:text-slate-100">Filters</span>
        </div>
      </div>

      <Stack gap={16}>
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
                label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
              }))
            }
            classNames={refinementClasses}
          />
        </FilterSection>

        <FilterSection title="Salary range (GBP)">
          <RangeInput
            attribute="salaryMin"
            classNames={{
              root: 'grid grid-cols-2 gap-1.5',
              input: 'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs focus:border-[#C9A84C]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 dark:border-[#2a2d3e] dark:bg-[#181b28] dark:text-slate-100 placeholder:text-slate-400',
              separator: 'hidden',
              submit: 'col-span-2 w-full rounded-lg bg-[#0D1B3E] py-2 text-xs font-semibold text-white hover:bg-[#162850] transition-colors dark:bg-[#C9A84C] dark:text-[#0D1B3E] dark:hover:bg-[#d4b75d]',
            }}
          />
        </FilterSection>

        <ToggleRefinement
          attribute="remotePolicy"
          on="remote"
          classNames={{
            root: 'flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#2a2d3e] dark:text-slate-400 dark:hover:bg-[#202433]',
            checkbox: 'h-4 w-4 accent-[#C9A84C] cursor-pointer',
            label: 'cursor-pointer text-sm',
          }}
          label="Remote only"
        />
      </Stack>
    </div>
  );
}
