import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { apiFetchServer } from '@/lib/api-server';
import { EditJobForm } from './edit-job-form';

export const metadata: Metadata = { title: 'Edit Job | BUKZ' };

interface JobListing {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  jobType: string;
  remotePolicy: string;
  experienceLevel: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  status: string;
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect('/auth/login');

  const listing = await apiFetchServer<JobListing>(`/jobs/listings/${params.id}`).catch(() => null);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <a href="/employers/dashboard" className="text-sm text-slate-400 hover:text-primary">← Back to dashboard</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Edit: {listing.title}</h1>
      </div>
      <EditJobForm listing={listing} />
    </div>
  );
}
