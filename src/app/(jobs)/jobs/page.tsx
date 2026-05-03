import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Accounting & Finance Jobs | BUKZ',
  description:
    'Find your next accounting or finance role. Filter by qualification, salary, remote policy and more.',
};

const JobsSearch = dynamic(
  () => import('./jobs-search').then((m) => ({ default: m.JobsSearch })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[92vh] items-center justify-center bg-[#0f2a2e]" />
    ),
  },
);

export default function JobsPage() {
  return <JobsSearch />;
}
