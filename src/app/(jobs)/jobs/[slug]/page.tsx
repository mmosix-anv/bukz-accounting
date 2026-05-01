import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/api';
import { JobDetailClient, type JobListing } from './job-detail.client';

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const job = await apiFetch<JobListing>(`/jobs/listings/${params.slug}`);
    return {
      title: `${job.title} | BUKZ Jobs`,
      description: job.description.slice(0, 160),
    };
  } catch {
    return { title: 'Job not found | BUKZ' };
  }
}

export default async function JobDetailPage({ params }: Props) {
  let job: JobListing;
  try {
    job = await apiFetch<JobListing>(`/jobs/listings/${params.slug}`);
  } catch {
    notFound();
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCandidate = user?.user_metadata?.['role'] === 'candidate';
  const shareUrl = `${process.env['NEXT_PUBLIC_APP_URL']}/jobs/${job.slug}`;

  return <JobDetailClient job={job} isCandidate={isCandidate} isAuthed={Boolean(user)} shareUrl={shareUrl} />;
}
