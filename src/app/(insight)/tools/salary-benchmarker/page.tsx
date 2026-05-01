import type { Metadata } from 'next';
import { SalaryBenchmarkerClient } from './salary-benchmarker-client';

export const metadata: Metadata = {
  title: 'Accounting Salary Benchmarker | BUKZ Insight',
  description: 'Compare your salary to market rates for accounting and finance roles across the UK. All figures in GBP.',
};

export default function SalaryBenchmarkerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Salary Benchmarker</h1>
        <p className="mt-2 text-slate-600">
          Compare your salary to live market data from UK accounting &amp; finance roles · All figures in GBP
        </p>
      </div>
      <SalaryBenchmarkerClient />
    </div>
  );
}
