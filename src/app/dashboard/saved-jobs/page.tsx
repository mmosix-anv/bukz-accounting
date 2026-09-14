import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSavedJobs } from '@/lib/services/saved-jobs.service';
import { SavedJobsClient } from './saved-jobs-client';

export const metadata: Metadata = { title: 'Saved Jobs | BUKZ' };

export default async function SavedJobsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect('/auth/login?redirectTo=/dashboard/saved-jobs');

  const rawJobs = await getSavedJobs(user.id).catch(() => []);
  const jobs = rawJobs.map((j) => ({
    ...j,
    savedAt: j.savedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2a2e]">Saved Jobs</h1>
          <p className="mt-0.5 text-sm text-slate-500">{jobs.length} saved job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/jobs"
          className="rounded-xl bg-[#0f2a2e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2a2e]/90"
        >
          Browse jobs
        </Link>
      </div>
      <SavedJobsClient jobs={jobs} />
    </div>
  );
}
