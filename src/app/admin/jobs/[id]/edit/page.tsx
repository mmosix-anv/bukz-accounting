import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAdminJobListingById } from '@/lib/services/admin.service';
import { AdminJobForm } from './admin-job-form';

export const metadata: Metadata = { title: 'Edit Job | Admin' };

export default async function AdminJobEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  const { id } = await params;
  const listing = await getAdminJobListingById(id).catch(() => null);
  if (!listing) notFound();

  const job = {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    location: listing.location,
    salaryMin: listing.salaryMin,
    salaryMax: listing.salaryMax,
    salaryCurrency: listing.salaryCurrency,
    jobType: listing.jobType,
    experienceLevel: listing.experienceLevel,
    remotePolicy: listing.remotePolicy,
    status: listing.status,
    featured: listing.featured,
    expiresAt: listing.expiresAt?.toISOString() ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/jobs" className="text-sm text-slate-500 hover:text-[#0f2a2e]">
          ← Back to Jobs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#0f2a2e]">Edit Job Listing</h1>
        <p className="mt-0.5 text-sm text-slate-500">/{listing.slug}</p>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft">
        <AdminJobForm job={job} token={session?.access_token} />
      </div>
    </div>
  );
}
