import type { Metadata } from 'next';
import { TaxCalculatorClient } from './tax-calculator-client';

export const metadata: Metadata = {
  title: 'UK Income Tax Calculator 2025/26 | BUKZ Insight',
  description: 'Calculate your take-home pay for 2025/26. All figures in GBP.',
};

export default function TaxCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">UK Income Tax Calculator</h1>
        <p className="mt-2 text-slate-600">
          2025/26 tax year · All figures in GBP · Income tax &amp; National Insurance
        </p>
      </div>
      <TaxCalculatorClient />
    </div>
  );
}
