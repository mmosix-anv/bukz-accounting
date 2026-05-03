import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Calculator, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Services | Bukz Accounting Services Ltd',
  description: 'Accounting, advisory, and financial education services for UK businesses and charities.',
};

const accounting = [
  'Bookkeeping',
  'VAT Returns',
  'Payroll Services',
  'Financial Statements',
  'Tax Compliance',
];

const advisory = [
  'Business Structuring',
  'Tax Planning',
  'Financial Strategy',
  'Growth & Scaling Support',
];

export default function ServicesPage() {
  return (
    <main className="overflow-hidden">
      {/* Header */}
      <section className="relative bg-[#0f2a2e] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Our Services</p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
            A full range of services tailored to your needs
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
            We provide accounting, advisory, and financial education designed around your business — not an off-the-shelf package.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Accounting */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 dark:border-[#183038] dark:bg-[#0D1E24]">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <Calculator size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Pillar One</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f2a2e] dark:text-white">Accounting</h2>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              Reliable, compliant, and stress-free financial management. We handle the numbers so you can focus on running your business.
            </p>
            <ul className="mt-6 space-y-3">
              {accounting.map((s) => (
                <li key={s} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={16} className="shrink-0 text-[#2cd7f2]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Advisory */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 dark:border-[#183038] dark:bg-[#0D1E24]">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Pillar Two</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f2a2e] dark:text-white">Advisory</h2>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
              Strategic financial support to help you grow and optimise your business. Decisions backed by expertise, tailored to your specific situation.
            </p>
            <ul className="mt-6 space-y-3">
              {advisory.map((s) => (
                <li key={s} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={16} className="shrink-0 text-[#2cd7f2]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Education CTA */}
        <div className="mt-8 rounded-2xl border border-[#2cd7f2]/20 bg-[#edf9fd] p-10 dark:border-[#0A4858] dark:bg-[#071E24]">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Pillar Three</p>
              <h2 className="mt-2 text-2xl font-bold text-[#0f2a2e] dark:text-white">Financial Education</h2>
              <p className="mt-2 max-w-lg text-slate-600 dark:text-slate-400">
                We don&apos;t just manage your finances — we help you understand them. Practical courses for founders and charities built around real-world insights.
              </p>
            </div>
            <Link
              href="/learn"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2cd7f2] px-6 py-3.5 text-sm font-semibold text-[#0f2a2e] transition-colors hover:bg-[#1bc6e2]"
            >
              Explore courses
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50/80 dark:border-[#0B2430] dark:bg-[#091820]">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0f2a2e] dark:text-white">Ready to get started?</h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Book a strategy call to discuss your accounting and advisory needs.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0f2a2e] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2]"
          >
            Book a Strategy Call
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
