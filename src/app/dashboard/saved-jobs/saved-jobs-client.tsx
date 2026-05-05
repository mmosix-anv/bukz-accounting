'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Trash2, Bookmark } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface SavedJob {
  jobId: string;
  savedAt: string;
  title: string;
  slug: string;
  location: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  jobType: string;
  remotePolicy: string;
  status: string;
}

function fmtSalary(min: string | null, max: string | null) {
  const fmt = (n: string) => `£${(Number(n) / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `from ${fmt(min)}`;
  if (max) return `up to ${fmt(max)}`;
  return null;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  interim: 'Interim',
  graduate: 'Graduate',
};

export function SavedJobsClient({ jobs: initial, token }: { jobs: SavedJob[]; token: string | undefined }) {
  const [jobs, setJobs] = useState(initial);

  async function handleUnsave(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    await apiFetch(`/jobs/saved/${jobId}`, { method: 'DELETE', token }).catch(() => null);
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-soft">
        <Bookmark className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-4 font-medium text-[#0f2a2e]">No saved jobs yet</p>
        <p className="mt-1 text-sm text-slate-500">Save jobs from listings to review them later.</p>
        <Link
          href="/jobs"
          className="mt-4 inline-block rounded-xl bg-[#2cd7f2] px-5 py-2 text-sm font-semibold text-[#0f2a2e] transition-colors hover:bg-[#2cd7f2]/80"
        >
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const salary = fmtSalary(job.salaryMin, job.salaryMax);
        return (
          <div
            key={job.jobId}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30"
          >
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.slug}`} className="text-base font-semibold text-[#0f2a2e] hover:text-[#2cd7f2] transition-colors">
                {job.title}
              </Link>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />{job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />{TYPE_LABELS[job.jobType] ?? job.jobType}
                </span>
                {salary && <span className="font-medium text-[#0f2a2e]">{salary}</span>}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  job.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="text-xs text-slate-400 capitalize">{job.remotePolicy}</span>
              </div>
            </div>
            <button
              onClick={() => void handleUnsave(job.jobId)}
              className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Remove from saved"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
