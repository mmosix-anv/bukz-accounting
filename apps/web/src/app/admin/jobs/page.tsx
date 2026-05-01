import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { MapPin, Eye, Users, Clock, Star } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Jobs' };

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-red-100 text-red-700',
  filled: 'bg-blue-100 text-blue-700',
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const statusFilter = params.status ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('job_listings')
    .select('id, title, status, location, salary_min, salary_max, views_count, applications_count, featured, created_at, expires_at', { count: 'exact' });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: jobs, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Job Listings</h1>
          <p className="mt-1 text-sm text-slate-500">{count ?? 0} listings</p>
        </div>
        <div className="flex gap-2">
          {['', 'active', 'draft', 'expired', 'filled'].map((status) => (
            <a
              key={status}
              href={`/admin/jobs${status ? `?status=${status}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </a>
          ))}
        </div>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stats</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Expires</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs?.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {job.featured && <Star className="h-4 w-4 text-accent fill-accent" />}
                      <div>
                        <p className="font-medium text-primary">{job.title}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {job.location ?? 'Remote'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {job.salary_min && job.salary_max
                      ? `£${Number(job.salary_min).toLocaleString()} - £${Number(job.salary_max).toLocaleString()}`
                      : job.salary_min
                      ? `From £${Number(job.salary_min).toLocaleString()}`
                      : 'Negotiable'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />{job.views_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{job.applications_count ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {job.expires_at
                      ? new Date(job.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/jobs/${job.id}`} className="text-sm font-medium text-accent hover:text-accent/80">
                        View
                      </a>
                      {job.status === 'draft' && (
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          Approve
                        </button>
                      )}
                      {job.status === 'active' && (
                        <button className="text-sm font-medium text-red-600 hover:text-red-700">
                          Expire
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/admin/jobs?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/jobs?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}