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
    subtitle: 'Accounting',
    description:
      'Reliable and compliant financial management to keep your business running smoothly.',
    href: '/services',
    cta: 'Explore Services',
    Icon: Calculator,
    services: ['Bookkeeping', 'VAT Returns', 'Payroll Services', 'Financial Statements', 'Tax Compliance'],
    accentColor: 'group-hover:border-blue-400/50',
  },
  {
    title: 'Advisory',
    subtitle: 'Advisory',
    description:
      'Strategic financial support to help you structure, plan, and grow your business effectively.',
    href: '/services',
    cta: 'Explore Services',
    Icon: TrendingUp,
    services: ['Business Structuring', 'Tax Planning', 'Financial Strategy', 'Growth and Scaling Support'],
    accentColor: 'group-hover:border-emerald-400/50',
  },
  {
    title: 'Education',
    subtitle: 'Education',
    description:
      "We don't just manage your finances—we help you understand them.",
    href: '/learn',
    cta: 'Explore Courses',
    Icon: GraduationCap,
    services: ['Practical courses for business owners and charities', 'Step-by-step financial guidance', 'Real-world insights you can apply immediately'],
    accentColor: 'group-hover:border-amber-400/50',
  },
];

const clients = [
  {
    Icon: Heart,
    title: 'Charities & CICs',
    description: 'Specialist support for compliance, reporting, and organisational structuring.',
  },
  {
    Icon: Briefcase,
    title: 'Founders & SMEs',
    description: 'Helping business owners manage finances and grow with confidence.',
  },
  {
    Icon: Building2,
    title: 'Growing Businesses',
    description: 'Strategic financial support for scaling and long-term success.',
  },
];

const whyBukz = [
  { Icon: Users, title: 'Personalised, one-on-one service', desc: '' },
  { Icon: Heart, title: 'Strong experience in the charity sector', desc: '' },
  { Icon: CheckCircle2, title: 'Practical, results-focused advice', desc: '' },
  { Icon: BookOpen, title: 'Clear and simple financial guidance', desc: '' },
  { Icon: Lightbulb, title: 'Modern, technology-enabled approach', desc: '' },
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
                We support charities, founders, and growing businesses with expert accounting, strategic advice, and practical financial education—so you can make confident decisions and grow sustainably.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in-up stagger-3 sm:flex-row lg:items-start">
                <Link href="/contact" className="btn-accent px-8">
                  Book a Strategy Call
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/learn"
                  className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25]"
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
      <section className="border-b border-slate-100 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { Icon: Shield, label: 'ICAEW Regulated Firm' },
              { Icon: Star, label: 'Trusted by UK Businesses and Charities' },
              { Icon: Users, label: 'Personalised, One-on-One Support' },
              { Icon: Lightbulb, label: 'Practical Financial Expertise' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 md:justify-start">
                <Icon size={15} className="shrink-0 text-[#2cd7f2]" />
                <span className="text-sm font-medium text-slate-600">{label}</span>
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
            <span className="text-sm font-semibold text-[#2cd7f2]">What We Do</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-[#0f2a2e] sm:text-4xl lg:text-5xl">
            Accounting. Advisory. Education.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className={`group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#2cd7f2]/30 hover:shadow-2xl hover:shadow-[#2cd7f2]/[0.06] lg:p-10 ${pillar.accentColor}`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f2a2e]/[0.04] transition-transform duration-300 group-hover:scale-105">
                <pillar.Icon size={24} className="text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2]" />
              </div>

              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">{pillar.subtitle}</p>
              <h3 className="mb-3 text-xl font-bold text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2]">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">{pillar.description}</p>

              <ul className="mt-5 flex-1 space-y-1.5">
                {pillar.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={12} className="shrink-0 text-[#2cd7f2]" />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0f2a2e] transition-colors duration-300 group-hover:text-[#2cd7f2]">
                {pillar.cta}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Who We Work With ────────────────────────────────────────────────── */}
      <section className="relative border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2cd7f2]" />
              <span className="text-sm font-semibold text-[#2cd7f2]">Who We Work With</span>
            </div>
            <h2 className="mt-3 text-balance text-3xl font-bold text-[#0f2a2e] sm:text-4xl">
              Who We Work With
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {clients.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2cd7f2]/20 bg-[#2cd7f2]/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} className="text-[#2cd7f2]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0f2a2e]">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why BUKZ ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f2a2e]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">Why Bukz</p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl">
              Most accountants focus on numbers. We focus on outcomes.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {whyBukz.map(({ Icon, title }) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] transition-all duration-300 group-hover:border-[#2cd7f2]/20 group-hover:bg-[#2cd7f2]/10">
                  <Icon size={22} className="text-[#2cd7f2]" />
                </div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
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
              <span className="text-sm font-semibold text-[#2cd7f2]">Learn With Bukz</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] sm:text-4xl">
              Learn With Bukz
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500">
              Financial clarity starts with understanding. Our learning platform gives you the knowledge and tools to manage your finances with confidence.
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
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3"
                >
                  <CheckCircle2 size={13} className="shrink-0 text-[#2cd7f2]" />
                  <span className="text-sm font-medium text-slate-700">{topic}</span>
                </div>
              ))}
            </div>

            <Link
              href="/learn"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0f2a2e] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#122e33]"
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
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd7f2]/10">
                  <Icon size={18} className="text-[#2cd7f2]" />
                </div>
                <h3 className="mb-1.5 font-semibold text-[#0f2a2e]">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0f2a2e]/5 px-4 py-1.5">
              <CheckCircle2 size={12} className="text-[#0f2a2e]" />
              <span className="text-sm font-semibold text-[#0f2a2e]">How It Works</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] sm:text-4xl">How It Works</h2>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Book a consultation', desc: 'We take time to understand your business and your needs' },
              { step: '02', title: 'Get tailored support', desc: 'We provide accounting and advisory services built around you' },
              { step: '03', title: 'Stay informed and in control', desc: 'Access ongoing support and financial education' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f2a2e] shadow-lg shadow-[#0f2a2e]/20">
                  <span className="text-lg font-bold text-[#2cd7f2]">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#0f2a2e]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[2rem] border border-slate-200/80 bg-[#0f2a2e] p-10 shadow-soft">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2cd7f2]/15">
              <span className="text-3xl font-bold text-[#2cd7f2]">MA</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2]">About the Founder</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Mutiu Adebukola Adejumobi</h3>
            <p className="mt-1 text-sm font-medium text-slate-400">ACA, BFP</p>
          </div>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2cd7f2]/10 px-4 py-1.5">
              <Award size={13} className="text-[#2cd7f2]" />
              <span className="text-sm font-semibold text-[#2cd7f2]">About the Founder</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0f2a2e] sm:text-4xl">
              About the Founder
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-500">
              Bukz Accounting Services Ltd is led by Mutiu Adebukola Adejumobi ACA, BFP, a Chartered Accountant (ICAEW), delivering tailored accounting and advisory services to businesses and charities.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              The firm combines technical expertise with a personalised approach, ensuring every client gains clarity, confidence, and control over their finances.
            </p>
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
                className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25]"
              >
                Explore Services
              </Link>
              <Link
                href="/learn"
                className="btn-secondary border-white/40 bg-white/[0.15] text-white shadow-none hover:border-white/60 hover:bg-white/[0.25]"
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
