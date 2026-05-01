import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/api';
import { InstructorDashboardClient } from './instructor-dashboard-client';

export const metadata: Metadata = { title: 'Instructor Dashboard | BUKZ Learn' };

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  enrollmentsCount: number;
  ratingAvg: string | null;
  ratingCount: number;
  priceGbp: string;
  cpdHours: string;
  level: string;
  createdAt: string;
}

export default async function InstructorDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/instructors/dashboard');

  const role = user.user_metadata?.['role'];
  if (role !== 'instructor' && role !== 'admin') redirect('/dashboard');

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const courses = await apiFetch<Course[]>('/learn/courses/instructor/my', { token }).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Instructor Dashboard</h1>
          <p className="mt-1 text-slate-500">Build and manage your CPD courses</p>
        </div>
      </div>
      <InstructorDashboardClient courses={courses} token={token} />
    </div>
  );
}
