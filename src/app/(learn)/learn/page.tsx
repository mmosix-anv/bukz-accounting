import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'CPD-Accredited Courses | BUKZ Learn',
  description:
    'Browse CPD-accredited accounting and finance courses. Earn recognised hours for ICAEW, ACCA, CIMA and AAT.',
};

const LearnSearch = dynamic(
  () => import('./learn-search').then((m) => ({ default: m.LearnSearch })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[92vh] items-center justify-center"
        style={{ background: 'linear-gradient(175deg, #07101f 0%, #0d1b3e 52%, #060c1b 100%)' }}
      />
    ),
  },
);

export default function LearnPage() {
  return <LearnSearch />;
}
