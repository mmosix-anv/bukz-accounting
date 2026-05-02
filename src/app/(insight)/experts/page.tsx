import type { Metadata } from 'next';
import { ExpertsDirectoryClient } from './experts-directory-client';
import { findAllExperts } from '@/lib/services/experts.service';

export const metadata: Metadata = {
  title: 'Accounting Experts Directory | BUKZ Insight',
  description: 'Book a consultation with verified UK accounting and finance specialists. Filter by specialisation.',
};

interface Expert {
  id: string;
  name: string;
  title: string;
  specialisations: string[];
  qualifications: string[];
  bio: string;
  avatarUrl: string | null;
  hourlyRateGbp: string | null;
  calUsername: string | null;
  isVerified: boolean;
}

export default async function ExpertsPage() {
  const experts = await findAllExperts().catch(() => [] as Expert[]);

  const allSpecialisations = Array.from(
    new Set(experts.flatMap((e) => e.specialisations)),
  ).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Expert Directory</h1>
        <p className="mt-2 text-slate-600">
          Book a consultation with verified UK accounting &amp; finance specialists
        </p>
      </div>
      <ExpertsDirectoryClient experts={experts} allSpecialisations={allSpecialisations} />
    </div>
  );
}
