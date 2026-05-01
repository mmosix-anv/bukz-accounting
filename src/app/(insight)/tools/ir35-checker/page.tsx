import type { Metadata } from 'next';
import { Ir35CheckerClient } from './ir35-checker-client';

export const metadata: Metadata = {
  title: 'IR35 Status Checker | BUKZ Insight',
  description: 'Assess your IR35 risk with our 15-question checker. Inside, borderline or outside determination with expert recommendations.',
};

export default function Ir35CheckerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">IR35 Status Checker</h1>
        <p className="mt-2 text-slate-600">
          Answer these questions to assess your IR35 risk. For guidance only — not legal advice.
        </p>
      </div>
      <Ir35CheckerClient />
    </div>
  );
}
