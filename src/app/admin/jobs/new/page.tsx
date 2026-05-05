import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminNewJobForm } from './admin-new-job-form';

export const metadata: Metadata = { title: 'New Job | Admin' };

export default async function AdminNewJobPage() {
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/jobs" className="text-sm text-slate-500 hover:text-[#0f2a2e]">
          ← Back to Jobs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#0f2a2e]">Create Job Listing</h1>
        <p className="mt-0.5 text-sm text-slate-500">Add a new job listing to the platform</p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft">
        <AdminNewJobForm token={session?.access_token} />
      </div>
    </div>
  );
}
