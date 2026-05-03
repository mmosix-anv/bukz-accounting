import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Users,
  Building2,
  Calculator,
  Star,
  Shield,
  Heart,
  Lightbulb,
  Briefcase,
  Award,
} from 'lucide-react';

const pillars = [
  {
    title: 'Accounting',
    subtitle: 'Reliable & Compliant',
    description:
      'Reliable, compliant, and stress-free financial management. From bookkeeping to tax compliance, we handle the numbers so you can focus on what you do best.',
    href: '/services',
    cta: 'Accounting services',
    Icon: Calculator,
    services: ['Bookkeeping', 'VAT Returns', 'Payroll Services', 'Financial Statements', 'Tax Compliance'],
    accentColor: 'group-hover:border-blue-400/50',
  },
  {
    title: 'Advisory',
    subtitle: 'Strategic Support',
    description:
      'Strategic financial support to help you grow and optimise your business. Decisions backed by expertise, tailored to your specific situation and goals.',
    href: '/services',
    cta: 'Advisory services',
    Icon: TrendingUp,
    services: ['Business Structuring', 'Tax Planning', 'Financial Strategy', 'Growth & Scaling Support'],
    accentColor: 'group-hover:border-emerald-400/50',
  },
  {
    title: 'Education',
    subtitle: 'Financial Literacy',
    description:
      "We don't just manage your finances — we help you understand them. Practical courses for founders and charities, built around real-world insights.",
    href: '/learn',
    cta: 'Explore courses',
    Icon: GraduationCap,
    services: ['Business Setup & Structuring', 'Charity Financial Compliance', 'UK Tax Essentials', 'Financial Systems for Growth'],
    accentColor: 'group-hover:border-amber-400/50',
  },
];

const clients = [
  {
    Icon: Heart,
    title: 'Charities & CICs',
    description: 'Specialist support for compliance, reporting, and structuring in the charity and social enterprise sector.',
  },
  {
    Icon: Briefcase,
    title: 'Founders & SMEs',
    description: 'Helping business owners build and grow with financial confidence from day one.',
  },
  {
    Icon: Building2,
    title: 'Growing Businesses',
    description: 'Strategic support for scaling operations and achieving long-term financial sustainability.',
  },
];

const whyBukz = [
  { Icon: Users, title: 'Personalised, one-on-one service', desc: 'Direct access to your accountant — not a call centre or rotating team.' },
  { Icon: Heart, title: 'Strong charity sector expertise', desc: 'Trusted by charities, CICs, and social enterprises across the UK.' },
  { Icon: CheckCircle2, title: 'Practical, results-driven advice', desc: 'We focus on outcomes for your business, not just compliance boxes.' },
  { Icon: BookOpen, title: 'Education that empowers clients', desc: 'We help you understand your finances, not just depend on us for them.' },
  { Icon: Lightbulb, title: 'Technology-driven approach', desc: 'Modern tools that make financial management efficient and transparent.' },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[88vh] items-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-gradient-mesh.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/38" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-4xl text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 backdrop-blur-sm animate-fade-in-up">
                <Shield size={13} className="text-[#2cd7f2]" />
                <span className="text-sm font-medium text-slate-300">ICAEW Regulated Practice</span>
              </div>

              <h1 className="hero-text text-4xl font-bold leading-[1.06] tracking-tight animate-fade-in-up stagger-1 sm:text-5xl lg:text-6xl">
                Accounting, Advisory &amp; Financial Education for Modern UK Businesses
              </h1>

              <p className="hero-muted mt-8 max-w-2xl text-lg leading-relaxed animate-fade-in-up stagger-2 sm:text-xl lg:mx-0">
                We help charities, founders, and growing businesses manage their finances, make better decisions, and build sustainable success through expert accounting, strategic advice, and practical financial education.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in-up stagger-3 sm:flex-row lg:items-start">
                <Link href="/contact" className="btn-accent px-8">
                  Book a Strategy Call
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/learn"
                  className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25] dark:border-white/30 dark:bg-white/[0.12] dark:hover:bg-white/[0.20]"
                >
                  Start Learning for Free
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up stagger-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    ['ICAEW Regulated', 'Qualified, regulated, and accountable to the highest standards.'],
                    ['Tailored to you', 'Personalised one-on-one service — not a one-size-fits-all approach.'],
                    ['Charity specialists', 'Deep expertise in charity compliance, CICs, and social enterprises.'],
                    ['Modern tools', 'Technology-driven approach for efficient, transparent financial management.'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-white/8 bg-black/10 px-4 py-4">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50/80 dark:border-[#0B2430] dark:bg-[#091820]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { Icon: Shield, label: 'ICAEW Regulated Firm' },
              { Icon: Star, label: 'Trusted by UK Businesses & Charities' },
              { Icon: Users, label: 'Tailored, One-on-One Support' },
              { Icon: Lightbulb, label: 'Modern Tools & Practical Expertise' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 md:justify-start">
                <Icon size={15} className="shrink-0 text-[#2cd7f2]" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three Pillars ───────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2cd7f2]" />
            <span className="text-sm font-semibold text-[#2cd7f2]">Our Services</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-[#0f2a2e] dark:text-white sm:text-4xl lg:text-5xl">
            Accounting. Advisory. Education.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Three integrated pillars designed to help UK businesses and charities achieve financial clarity and sustainable growth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className={`group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#2cd7f2]/30 hover:shadow-2xl hover:shadow-[#2cd7f2]/[0.06] dark:border-[#183038] dark:bg-[#0D1E24] lg:p-10 ${pillar.accentColor}`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f2a2e]/[0.04] transition-transform duration-300 group-hover:scale-105 dark:bg-white/5">
                <pillar.Icon size={24} className="text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2] dark:text-slate-300" />
              </div>

              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">{pillar.subtitle}</p>
              <h3 className="mb-3 text-xl font-bold text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2] dark:text-white">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{pillar.description}</p>

              <ul className="mt-5 flex-1 space-y-1.5">
                {pillar.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={12} className="shrink-0 text-[#2cd7f2]" />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2] dark:text-slate-100">
                {pillar.cta}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Who We Work With ────────────────────────────────────────────────── */}
      <section className="relative border-y border-slate-100 bg-slate-50/80 dark:border-[#0B2430] dark:bg-[#091820]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2cd7f2]" />
              <span className="text-sm font-semibold text-[#2cd7f2]">Who We Work With</span>
            </div>
            <h2 className="mt-3 text-balance text-3xl font-bold text-[#0f2a2e] dark:text-white sm:text-4xl">
              Built for businesses and charities that want to grow with clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {clients.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30 hover:shadow-xl dark:border-[#183038] dark:bg-[#0D1E24]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2cd7f2]/20 bg-[#2cd7f2]/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} className="text-[#2cd7f2]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0f2a2e] dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why BUKZ ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f2a2e] dark:bg-[#0a0c14]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Why BUKZ</p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl">
              Most accountants focus on numbers. We focus on outcomes.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {whyBukz.map(({ Icon, title, desc }) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] transition-all duration-300 group-hover:border-[#2cd7f2]/20 group-hover:bg-[#2cd7f2]/10">
                  <Icon size={22} className="text-[#2cd7f2]" />
                </div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learn with BUKZ ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
              <GraduationCap size={13} className="text-[#2cd7f2]" />
              <span className="text-sm font-semibold text-[#2cd7f2]">BUKZ Learn</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] dark:text-white sm:text-4xl">
              Financial clarity starts with understanding.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Our learning platform helps you understand your finances, stay compliant, and make better decisions — so you&apos;re never in the dark about your own business.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Business setup and structuring',
                'Charity financial compliance',
                'UK tax essentials',
                'Financial systems for growth',
              ].map((topic) => (
                <div
                  key={topic}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-[#183038] dark:bg-[#0D1E24]"
                >
                  <CheckCircle2 size={13} className="shrink-0 text-[#2cd7f2]" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{topic}</span>
                </div>
              ))}
            </div>

            <Link
              href="/learn"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0f2a2e] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#122e33] dark:bg-[#2cd7f2] dark:text-[#0f2a2e] dark:hover:bg-[#1bc6e2]"
            >
              Start Learning
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { Icon: BookOpen, title: 'Understand your finances', desc: 'Practical courses that explain the concepts behind your numbers.' },
              { Icon: Shield, title: 'Stay compliant', desc: 'Stay up to date with HMRC requirements, VAT rules, and reporting deadlines.' },
              { Icon: CheckCircle2, title: 'Make better decisions', desc: 'Financial education that translates directly into smarter business choices.' },
              { Icon: Award, title: 'Build confidence', desc: 'Led by qualified accountants with real-world experience in your sector.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-[#183038] dark:bg-[#0D1E24]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd7f2]/10">
                  <Icon size={18} className="text-[#2cd7f2]" />
                </div>
                <h3 className="mb-1.5 font-semibold text-[#0f2a2e] dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50/80 dark:border-[#0B2430] dark:bg-[#091820]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0f2a2e]/5 px-4 py-1.5 dark:bg-white/5">
              <CheckCircle2 size={12} className="text-[#0f2a2e] dark:text-white" />
              <span className="text-sm font-semibold text-[#0f2a2e] dark:text-white">How It Works</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] dark:text-white sm:text-4xl">Simple to get started</h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Start with a consultation', desc: 'We take time to understand your business, your challenges, and your goals.' },
              { step: '02', title: 'Get tailored support', desc: 'Accounting and advisory services designed specifically for your situation — not an off-the-shelf package.' },
              { step: '03', title: 'Continue learning', desc: 'Access our financial education platform to stay informed, compliant, and in control.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f2a2e] shadow-lg shadow-[#0f2a2e]/20">
                  <span className="text-lg font-bold text-[#2cd7f2]">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#0f2a2e] dark:text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[2rem] border border-slate-200/80 bg-[#0f2a2e] p-10 shadow-soft dark:border-[#183038]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2cd7f2]/15">
              <span className="text-3xl font-bold text-[#2cd7f2]">MA</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Founder</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Mutiu Adebukola Adejumobi</h3>
            <p className="mt-1 text-sm font-medium text-slate-400">ICAEW Chartered Accountant</p>
            <p className="mt-6 text-base leading-relaxed text-slate-300">
              &ldquo;Bukz Accounting Services combines technical expertise with a personalised approach, ensuring clients gain clarity, confidence, and control over their finances.&rdquo;
            </p>
          </div>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
              <Award size={13} className="text-[#2cd7f2]" />
              <span className="text-sm font-semibold text-[#2cd7f2]">About Us</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] dark:text-white sm:text-4xl">
              A firm built on expertise and genuine relationships.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Bukz Accounting Services Ltd is a UK-based accounting firm providing accounting, advisory, and financial education services to charities, founders, and growing businesses.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
              We focus on delivering tailored solutions that help organisations achieve financial clarity and sustainable growth — combining technical excellence with a genuinely personal service.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2cd7f2] transition-colors hover:text-[#0a7a8c] dark:hover:text-[#a8ecf8]"
            >
              Learn more about us
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center sm:p-20"
          style={{
            backgroundImage: "url('/images/hero-gradient-mesh.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-[#0f2a2e]/80" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
              Speak with us to discuss your accounting, advisory, or learning needs.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact" className="btn-accent px-8">
                Book a Strategy Call
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/services"
                className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25] dark:border-white/30 dark:bg-white/[0.12] dark:hover:bg-white/[0.20]"
              >
                Explore Services
              </Link>
              <Link
                href="/learn"
                className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25] dark:border-white/30 dark:bg-white/[0.12] dark:hover:bg-white/[0.20]"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
