import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { findJobListingBySlug, incrementJobViews } from '@/lib/services/job-listings.service';
import { JobDetailClient, type JobListing } from './job-detail.client';

const getJob = cache(findJobListingBySlug);

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const job = await getJob(params.slug);
    return {
      title: `${job.title} | BUKZ Jobs`,
      description: job.description.slice(0, 160),
    };
  } catch {
    return { title: 'Job not found | BUKZ' };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const supabase = createClient();
  const [listingResult, { data: { user } }] = await Promise.all([
    getJob(params.slug).catch(() => null),
    supabase.auth.getUser(),
  ]);

  if (!listingResult) notFound();
  const listing = listingResult;

  void incrementJobViews(listing.id).catch(() => undefined);
  const isCandidate = user?.user_metadata?.['role'] === 'candidate';
  const shareUrl = `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/jobs/${listing.slug}`;

  const job: JobListing = {
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
    qualifications: listing.qualifications,
    softwareSkills: listing.softwareSkills,
    featured: listing.featured,
    viewsCount: listing.viewsCount,
    applicationsCount: listing.applicationsCount,
    createdAt: listing.createdAt.toISOString(),
  };

  return <JobDetailClient job={job} isCandidate={isCandidate} isAuthed={Boolean(user)} shareUrl={shareUrl} />;
}
