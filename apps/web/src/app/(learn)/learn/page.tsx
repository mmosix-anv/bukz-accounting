import type { Metadata } from 'next';
import { LearnSearch } from './learn-search';

export const metadata: Metadata = {
  title: 'CPD-Accredited Courses | BUKZ Learn',
  description:
    'Browse CPD-accredited accounting and finance courses. Earn recognised hours for ICAEW, ACCA, CIMA and AAT.',
};

export default function LearnPage() {
  return <LearnSearch />;
}
