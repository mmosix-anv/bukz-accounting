import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewCourseForm } from './new-course-form';

export const metadata: Metadata = { title: 'Create Course | BUKZ Learn' };

export default async function NewCoursePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!['instructor', 'admin'].includes(user.user_metadata?.['role'])) redirect('/dashboard');

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <a href="/instructors/dashboard" className="text-sm text-slate-400 hover:text-primary">← Back to dashboard</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Create a new course</h1>
        <p className="mt-1 text-slate-500">Fill in the details below. You can add lessons after creating the course.</p>
      </div>
      <NewCourseForm token={token} />
    </div>
  );
}
