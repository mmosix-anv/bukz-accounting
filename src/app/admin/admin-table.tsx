import React from 'react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

interface Props {
  columns: Column[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminTable({ columns, children, footer }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
}

export function AdminTr({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`transition-colors hover:bg-slate-50 ${className}`}>
      {children}
    </tr>
  );
}

export function AdminTd({ children, className = '', align }: { children: React.ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <td className={`px-4 py-3 text-sm ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''} ${className}`}>
      {children}
    </td>
  );
}

interface FilterTabsProps {
  options: { value: string; label: string }[];
  current: string;
  buildHref: (value: string) => string;
}

export function FilterTabs({ options, current, buildHref }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <a
          key={opt.value}
          href={buildHref(opt.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            current === opt.value
              ? 'bg-[#0f2a2e] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {opt.label}
        </a>
      ))}
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <a href={buildHref(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            ← Previous
          </a>
        )}
        {page < totalPages && (
          <a href={buildHref(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Next →
          </a>
        )}
      </div>
    </div>
  );
}
