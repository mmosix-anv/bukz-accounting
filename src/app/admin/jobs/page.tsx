import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MapPin, Eye, Users } from 'lucide-react';
import { AdminTable, AdminTr, AdminTd, FilterTabs, Pagination } from '../admin-table';

export const metadata: Metadata = { title: 'Jobs | Admin' };

const STATUS_COLOURS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  expired: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  filled: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
};

function fmtSalary(min?: number | null, max?: number | null) {
  const fmt = (n: number) => `£${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `from ${fmt(min)}`;
  if (max) return `up to ${fmt(max)}`;
  return '—';
}

const PAGE_SIZE = 20;

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  const params = await searchParams;
  const statusFilter = params.status ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('job_listings')
    .select('id, title, status, location, salary_min, salary_max, views_count, applications_count, featured, created_at, expires_at', { count: 'exact' });
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data: jobs, count } = await query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E] dark:text-white">Job listings</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{count ?? 0} total listings</p>
        </div>
        <FilterTabs
          options={[
            { value: '', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'expired', label: 'Expired' },
            { value: 'filled', label: 'Filled' },
          ]}
          current={statusFilter}
          buildHref={(v) => `/admin/jobs${v ? `?status=${v}` : ''}`}
        />
      </div>

      <AdminTable
        columns={[
          { key: 'title', label: 'Job' },
          { key: 'status', label: 'Status' },
          { key: 'stats', label: 'Stats', align: 'center' },
          { key: 'salary', label: 'Salary' },
          { key: 'expires', label: 'Expires' },
          { key: 'actions', label: '', align: 'right' },
        ]}
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => `/admin/jobs?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
          />
        }
      >
        {jobs?.map((job) => (
          <AdminTr key={job.id}>
            <AdminTd>
              <div>
                <p className="font-medium text-[#0D1B3E] dark:text-slate-100">{job.title}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={10} />
                  {job.location ?? 'Remote'}
                </p>
              </div>
            </AdminTd>
            <AdminTd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[job.status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </AdminTd>
            <AdminTd align="center">
              <div className="flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Eye size={11} />{job.views_count ?? 0}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Users size={11} />{job.applications_count ?? 0}</span>
              </div>
            </AdminTd>
            <AdminTd className="text-slate-600 dark:text-slate-400">
              {fmtSalary(job.salary_min, job.salary_max)}
            </AdminTd>
            <AdminTd className="text-slate-500 dark:text-slate-400">
              {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
            </AdminTd>
            <AdminTd align="right">
              <div className="flex items-center justify-end gap-3">
                <a href={`/jobs/${job.id}`} className="text-xs text-slate-500 hover:text-[#0D1B3E] dark:hover:text-slate-200">View</a>
                <a href={`/admin/jobs/${job.id}/edit`} className="text-xs font-medium text-[#C9A84C] hover:text-[#B8943A]">Edit</a>
              </div>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
