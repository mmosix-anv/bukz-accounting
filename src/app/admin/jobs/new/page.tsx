import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AdminNewJobForm } from './admin-new-job-form';

export const metadata: Metadata = { title: 'New Job | Admin' };

export default async function AdminNewJobPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'admin') redirect('/dashboard');

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
        <AdminNewJobForm />
      </div>
    </div>
  );
}
