import type { Metadata } from 'next';
import { JobsSearch } from './jobs-search';

export const metadata: Metadata = {
  title: 'Accounting & Finance Jobs | BUKZ',
  description:
    'Find your next accounting or finance role. Filter by qualification, salary, remote policy and more.',
};

export default function JobsPage() {
  return <JobsSearch />;
}
