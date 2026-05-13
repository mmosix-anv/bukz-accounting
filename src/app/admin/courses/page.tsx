import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Star, Users, Plus, BookOpen } from 'lucide-react';
import { Button } from '@mantine/core';
import { AdminTable, AdminTr, AdminTd, FilterTabs, Pagination } from '../admin-table';
import { findAllAdminCourses } from '@/lib/services/courses.service';
import { getAdminCoursesCount } from '@/lib/services/admin.service';
import { DeleteCourseButton } from './delete-course-button';

export const metadata: Metadata = { title: 'Courses | Admin' };

const STATUS_COLOURS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-red-50 text-red-600',
};

const LEVEL_COLOURS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
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

  const [rawCourses, count] = await Promise.all([
    findAllAdminCourses(statusFilter || undefined, PAGE_SIZE, offset),
    getAdminCoursesCount(statusFilter || undefined),
  ]);
  const courses = rawCourses.map((c) => ({
    ...c, createdAt: c.createdAt.toISOString(),
  }));
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2a2e]">Courses</h1>
          <p className="mt-0.5 text-sm text-slate-500">{count ?? 0} total courses</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses/new">
            <Button color="primary" leftSection={<Plus size={16} />}>
              Create Course
            </Button>
          </Link>
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
              <p className="font-medium text-[#0f2a2e]">{course.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-slate-500">{course.cpdHours} CPD hrs</span>
                {course.ratingAvg && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-600">
                    <Star size={10} className="fill-amber-400" />
                    {Number(course.ratingAvg).toFixed(1)}
                  </span>
                )}
              </div>
            </AdminTd>
            <AdminTd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOURS[course.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </span>
            </AdminTd>
            <AdminTd>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOURS[course.level ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                {(course.level ?? 'unknown').charAt(0).toUpperCase() + (course.level ?? 'unknown').slice(1)}
              </span>
            </AdminTd>
            <AdminTd className="text-slate-600">
              {Number(course.priceGbp) === 0 ? 'Free' : `£${Math.round(Number(course.priceGbp))}`}
            </AdminTd>
            <AdminTd align="center">
              <span className="flex items-center justify-center gap-1 text-sm text-slate-500">
                <Users size={12} />{course.enrollmentsCount ?? 0}
              </span>
            </AdminTd>
            <AdminTd align="right">
              <div className="flex items-center justify-end gap-3">
                <a href={`/learn/${course.slug}`} className="text-xs text-slate-500 hover:text-[#0f2a2e]">View</a>
                <a href={`/admin/courses/${course.id}/edit`} className="text-xs font-medium text-[#2cd7f2] hover:text-[#B8943A]">Edit</a>
                <a href={`/admin/courses/${course.id}/sections`} className="text-xs font-medium text-slate-500 hover:text-[#0f2a2e] flex items-center gap-1">
                  <BookOpen size={12} /> Content
                </a>
                <a href={`/admin/courses/${course.id}/enrollments`} className="text-xs font-medium text-slate-500 hover:text-[#0f2a2e] flex items-center gap-1">
                  <Users size={12} /> Enrollments
                </a>
                <a href={`/admin/courses/${course.id}/quizzes`} className="text-xs font-medium text-violet-600 hover:text-violet-800 flex items-center gap-1">
                  Quizzes
                </a>
                <DeleteCourseButton courseId={course.id} token={token} />
              </div>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
