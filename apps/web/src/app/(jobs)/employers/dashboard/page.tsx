import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { EmployerDashboardClient } from './employer-dashboard-client';

export const metadata: Metadata = { title: 'Employer Dashboard | BUKZ Jobs' };

interface EmployerStats {
  activeListings: number;
  totalApplications: number;
  totalViews: number;
  totalListings: number;
}

interface JobListing {
  id: string;
  title: string;
  slug: string;
  status: string;
  applicationsCount: number;
  viewsCount: number;
  featured: boolean;
  expiresAt: string | null;
  createdAt: string;
  jobType: string;
  location: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
}

export default async function EmployerDashboardPage({
  searchParams,
}: {
  searchParams: { posted?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirectTo=/employers/dashboard');
  if (user.user_metadata?.['role'] !== 'employer' && user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const [stats, listings] = await Promise.all([
    apiFetch<EmployerStats>('/jobs/employers/me/stats', { token }).catch(() => ({
      activeListings: 0, totalApplications: 0, totalViews: 0, totalListings: 0,
    })),
    apiFetch<JobListing[]>('/jobs/employers/me/listings', { token }).catch(() => [] as JobListing[]),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Employer Dashboard</h1>
          <p className="mt-1 text-slate-500">Manage your job listings and applications</p>
        </div>
        <a
          href="/employers/post-job"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          + Post a job
        </a>
      </div>

      {searchParams.posted && (
        <div className="mb-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Your job has been submitted. It will go live once payment is confirmed.
        </div>
      )}

      <EmployerDashboardClient stats={stats} listings={listings} token={token} />
    </div>
  );
}
