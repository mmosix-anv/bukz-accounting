import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Star, Users } from 'lucide-react';
import { AdminTable, AdminTr, AdminTd, FilterTabs, Pagination } from '../admin-table';

export const metadata: Metadata = { title: 'Courses | Admin' };

const STATUS_COLOURS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  archived: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
};

const LEVEL_COLOURS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  advanced: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

const PAGE_SIZE = 20;

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  const params = await searchParams;
  const statusFilter = params.status ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('courses')
    .select('id, title, slug, status, level, price_gbp, cpd_hours, enrollments_count, rating_avg, created_at', { count: 'exact' });
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data: courses, count } = await query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2a2e] dark:text-white">Courses</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{count ?? 0} total courses</p>
        </div>
        <FilterTabs
          options={[
            { value: '', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' },
          ]}
          current={statusFilter}
          buildHref={(v) => `/admin/courses${v ? `?status=${v}` : ''}`}
        />
      </div>

      <AdminTable
        columns={[
          { key: 'title', label: 'Course' },
          { key: 'status', label: 'Status' },
          { key: 'level', label: 'Level' },
          { key: 'price', label: 'Price' },
          { key: 'enrollments', label: 'Enrolled', align: 'center' },
          { key: 'actions', label: '', align: 'right' },
        ]}
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => `/admin/courses?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
          />
        }
      >
        {courses?.map((course) => (
          <AdminTr key={course.id}>
            <AdminTd>
              <p className="font-medium text-[#0f2a2e] dark:text-slate-100">{course.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{course.cpd_hours} CPD hrs</span>
                {course.rating_avg && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    {Number(course.rating_avg).toFixed(1)}
                  </span>
                )}
              </div>
            </AdminTd>
            <AdminTd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[course.status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </span>
            </AdminTd>
            <AdminTd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOURS[course.level ?? ''] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {(course.level ?? 'unknown').charAt(0).toUpperCase() + (course.level ?? 'unknown').slice(1)}
              </span>
            </AdminTd>
            <AdminTd className="text-slate-600 dark:text-slate-400">
              {Number(course.price_gbp) === 0 ? 'Free' : `£${Math.round(Number(course.price_gbp))}`}
            </AdminTd>
            <AdminTd align="center">
              <span className="flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Users size={12} />{course.enrollments_count ?? 0}
              </span>
            </AdminTd>
            <AdminTd align="right">
              <div className="flex items-center justify-end gap-3">
                <a href={`/learn/${course.slug}`} className="text-xs text-slate-500 hover:text-[#0f2a2e] dark:hover:text-slate-200">View</a>
                <a href={`/instructors/courses/${course.id}/edit`} className="text-xs font-medium text-[#2cd7f2] hover:text-[#B8943A]">Edit</a>
              </div>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
