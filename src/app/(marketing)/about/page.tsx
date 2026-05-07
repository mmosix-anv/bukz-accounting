import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, CheckCircle2, Heart, Users, Lightbulb, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Bukz Accounting Services Ltd',
  description: 'ICAEW regulated accounting firm providing accounting, advisory, and financial education for UK businesses and charities.',
};

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      {/* Header */}
      <section className="relative bg-[#0f2a2e] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">About Us</p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">About Bukz Accounting Services Ltd</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
            A UK-based accounting firm built on expertise, genuine relationships, and a commitment to helping our clients succeed.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0f2a2e] dark:text-white">
              We focus on delivering tailored solutions that help businesses and charities achieve clarity and sustainable growth.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Bukz Accounting Services Ltd provides accounting, advisory, and financial education services to charities, founders, and growing businesses across the UK.
            </p>
            <p className="mt-4 leading-relaxed text-slate-500 dark:text-slate-400">
              We combine technical excellence with a genuinely personal service — giving every client direct access to a qualified accountant who understands their business and is invested in their success.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { Icon: Shield, label: 'ICAEW Regulated' },
                { Icon: Users, label: 'One-on-one service' },
                { Icon: Heart, label: 'Charity sector specialists' },
                { Icon: Lightbulb, label: 'Technology-driven approach' },
                { Icon: CheckCircle2, label: 'Results-driven advice' },
                { Icon: BookOpen, label: 'Education that empowers' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-[#183038] dark:bg-[#0D1E24]">
                  <Icon size={14} className="shrink-0 text-[#2cd7f2]" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Founder */}
          <div className="rounded-[2rem] border border-slate-200/80 bg-[#0f2a2e] p-10 shadow-soft dark:border-[#183038]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2cd7f2]/15">
              <span className="text-3xl font-bold text-[#2cd7f2]">MA</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Founder</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Mutiu Adebukola Adejumobi</h3>
            <p className="mt-1 text-sm font-medium text-[#2cd7f2]/70">ACA, BFP</p>
            <p className="mt-6 text-base leading-relaxed text-slate-300">
              &ldquo;Bukz Accounting Services combines technical expertise with a personalised approach, ensuring clients gain clarity, confidence, and control over their finances.&rdquo;
            </p>
            <div className="mt-8 space-y-2 border-t border-white/[0.08] pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield size={13} className="text-[#2cd7f2]" />
                ICAEW Regulated Practice
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Heart size={13} className="text-[#2cd7f2]" />
                Specialist in charities, CICs &amp; social enterprises
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50/80 dark:border-[#0B2430] dark:bg-[#091820]">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0f2a2e] dark:text-white">Work with us</h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Book a strategy call to discuss how we can support your business or charity.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f2a2e] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2]"
            >
              Book a Strategy Call
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-[#0f2a2e] shadow-sm transition-all duration-200 hover:border-[#2cd7f2] hover:bg-[#edf9fd] hover:shadow-md dark:border-[#2A4048] dark:bg-[#0D1E24] dark:text-slate-100 dark:hover:border-[#2cd7f2]/60 dark:hover:bg-[#0B2430]"
            >
              Our services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
