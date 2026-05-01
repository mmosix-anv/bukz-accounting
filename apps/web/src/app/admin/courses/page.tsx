import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { Star, Users, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Courses' };

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-700',
};

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

export default async function AdminCoursesPage({
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
    .from('courses')
    .select('id, title, slug, status, level, price_gbp, cpd_hours, enrollments_count, rating_avg, created_at', { count: 'exact' });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: courses, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">{count ?? 0} courses</p>
        </div>
        <div className="flex gap-2">
          {['', 'published', 'draft', 'archived'].map((status) => (
            <a
              key={status}
              href={`/admin/courses${status ? `?status=${status}` : ''}`}
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Stats</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses?.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-primary">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">CPD: {course.cpd_hours} hrs</span>
                        {course.rating_avg && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {Number(course.rating_avg).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[course.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColors[course.level ?? ''] ?? 'bg-slate-100 text-slate-700'}`}>
                      {course.level ?? 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {Number(course.price_gbp) === 0 ? 'Free' : `£${Number(course.price_gbp).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Users className="h-3 w-3" />{course.enrollments_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/learn/${course.slug}`} className="text-sm font-medium text-accent hover:text-accent/80">
                        View
                      </a>
                      {course.status === 'draft' && (
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          Publish
                        </button>
                      )}
                      {course.status === 'published' && (
                        <button className="text-sm font-medium text-red-600 hover:text-red-700">
                          Archive
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
                <a href={`/admin/courses?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/courses?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
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