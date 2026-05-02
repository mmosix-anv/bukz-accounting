import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Building2,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const pillars = [
  {
    title: 'BUKZ Jobs',
    subtitle: 'Specialist Job Board',
    description:
      'Roles curated exclusively for ACA, ACCA, CIMA and AAT professionals. Filter by qualification, sector, salary band and remote working policy.',
    href: '/jobs',
    cta: 'Browse jobs',
    icon: '/images/icon-jobs.svg',
    stat: '2,500+',
    statLabel: 'Active roles',
    accentBorder: 'group-hover:border-blue-400/50',
  },
  {
    title: 'BUKZ Learn',
    subtitle: 'CPD-Accredited Courses',
    description:
      'Structured courses built by practising accountants. Track CPD hours, earn certificates, and meet ICAEW, ACCA and CIMA requirements.',
    href: '/learn',
    cta: 'Explore courses',
    icon: '/images/icon-learn.svg',
    stat: '150+',
    statLabel: 'CPD courses',
    accentBorder: 'group-hover:border-emerald-400/50',
  },
  {
    title: 'BUKZ Insight',
    subtitle: 'Expert Analysis & Tools',
    description:
      'Tax tools, salary benchmarker, IR35 checker, and expert commentary from verified accounting specialists across all major disciplines.',
    href: '/insight',
    cta: 'Read insight',
    icon: '/images/icon-insight.svg',
    stat: '50+',
    statLabel: 'Expert contributors',
    accentBorder: 'group-hover:border-amber-400/50',
  },
];

const stats = [
  { value: '15,000+', label: 'Finance professionals', icon: Users },
  { value: '2,500+', label: 'Active job listings', icon: BookOpen },
  { value: '98%', label: 'Placement satisfaction', icon: Award },
  { value: '£85k', label: 'Average salary placed', icon: TrendingUp },
];

const firms = [
  { name: 'Deloitte', tier: 'Big 4' },
  { name: 'KPMG', tier: 'Big 4' },
  { name: 'PwC', tier: 'Big 4' },
  { name: 'EY', tier: 'Big 4' },
  { name: 'Grant Thornton', tier: 'Top 10' },
  { name: 'BDO', tier: 'Top 10' },
  { name: 'RSM', tier: 'Top 10' },
  { name: 'Mazars', tier: 'Top 10' },
];

const testimonials = [
  {
    quote:
      'BUKZ connected me with my dream role in under two weeks. The qualification-specific filtering saved me hours of searching.',
    name: 'Sarah Mitchell',
    role: 'Senior Tax Manager',
    firm: 'Grant Thornton',
    rating: 5,
  },
  {
    quote:
      'The CPD courses are genuinely useful — not just box-ticking. I completed my ICAEW requirement entirely through BUKZ Learn.',
    name: 'James Crawford',
    role: 'Audit Manager',
    firm: 'Mid-tier practice',
    rating: 5,
  },
  {
    quote:
      'As a hiring manager, the quality of candidates through BUKZ is unmatched. Every applicant has verified qualifications.',
    name: 'Rachel Nguyen',
    role: 'Finance Director',
    firm: 'FTSE 250 company',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section
        className="relative flex min-h-[88vh] items-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-gradient-mesh.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto grid max-w-6xl items-end gap-14 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-4xl text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 backdrop-blur-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-slate-300">2,500+ roles live now</span>
                <Sparkles size={12} className="text-[#C9A84C]" />
              </div>

              <h1 className="hero-text text-4xl font-bold leading-[1.02] tracking-tight animate-fade-in-up stagger-1 sm:text-5xl lg:text-7xl">
                The UK&apos;s specialist platform for accounting and finance careers.
              </h1>

              <p className="hero-muted mt-8 max-w-2xl text-lg leading-relaxed animate-fade-in-up stagger-2 sm:text-xl lg:mx-0">
                Find your next role, earn CPD-accredited qualifications, and access expert
                insight in one focused platform built for finance professionals.
              </p>

              <div className="mt-12 max-w-3xl animate-fade-in-up stagger-3">
                <form className="grid gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-[1fr_1fr_auto]">
                  <div className="input-shell relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Job title, skill or keyword"
                      className="w-full rounded-[1.1rem] bg-transparent py-4 pl-11 pr-5 text-sm placeholder:text-slate-400 focus:outline-none dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div className="input-shell relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      type="text"
                      placeholder="City or postcode"
                      className="w-full rounded-[1.1rem] bg-transparent py-4 pl-11 pr-5 text-sm placeholder:text-slate-400 focus:outline-none dark:placeholder:text-slate-500"
                    />
                  </div>
                  <Link href="/jobs" className="btn-accent px-8">
                    <Search size={16} />
                    Search jobs
                  </Link>
                </form>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <span className="text-xs text-slate-500">Popular:</span>
                  {['Management Accountant', 'Tax Advisor', 'Finance Director', 'Audit Senior'].map(
                    (term) => (
                      <Link
                        key={term}
                        href={`/jobs?q=${encodeURIComponent(term)}`}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400 transition-all duration-200 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 hover:text-white"
                      >
                        {term}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up stagger-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    ['Verified employers', 'Only specialist finance employers and hiring teams.'],
                    ['Structured learning', 'CPD tracking, certificates, and cohort-ready courses.'],
                    ['Market signal', 'Salary and career intelligence from live demand.'],
                    ['Editorial depth', 'Practical insight for tax, audit, and advisory roles.'],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/8 bg-black/10 px-4 py-4"
                    >
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

      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#2a2d3e] dark:bg-[#181b28] sm:p-8 animate-fade-in-up stagger-${index + 1}`}
              >
                <div className="relative">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D1B3E]/5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C9A84C]/10 dark:bg-white/5">
                    <Icon
                      size={20}
                      className="text-[#0D1B3E] transition-colors duration-300 group-hover:text-[#C9A84C] dark:text-slate-100"
                    />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-[#0D1B3E] dark:text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-sm font-semibold text-[#C9A84C]">Our Platform</span>
            </div>
            <h2 className="mt-3 text-balance text-3xl font-bold leading-tight text-[#0D1B3E] dark:text-white sm:text-4xl lg:text-5xl">
              Everything you need to advance your finance career
            </h2>
            <p className="mt-5 mx-auto max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Three integrated pillars designed specifically for UK accounting and finance
              professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {pillars.map((pillar) => (
              <Link
                key={pillar.title}
                href={pillar.href}
                className={`group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#C9A84C]/30 hover:shadow-2xl hover:shadow-[#C9A84C]/[0.06] dark:border-[#2a2d3e] dark:bg-[#181b28] lg:p-10 ${pillar.accentBorder}`}
              >

                <div className="relative">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#0D1B3E]/[0.03] p-2 transition-transform duration-300 group-hover:scale-105">
                      <Image src={pillar.icon} alt="" width={64} height={64} />
                    </div>
                    <span className="text-right">
                      <span className="block text-3xl font-bold tracking-tight text-[#0D1B3E] dark:text-white">
                        {pillar.stat}
                      </span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {pillar.statLabel}
                      </span>
                    </span>
                  </div>

                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                    {pillar.subtitle}
                  </p>
                  <h3 className="mb-4 text-xl font-bold text-[#0D1B3E] transition-colors duration-300 group-hover:text-[#C9A84C] dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {pillar.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0D1B3E] transition-colors duration-300 group-hover:text-[#C9A84C] dark:text-slate-100">
                    {pillar.cta}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-slate-100 bg-slate-50/80 dark:border-[#202433] dark:bg-[#10131d]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-[#2a2d3e] dark:bg-[#181b28]">
              <Building2 size={14} className="text-[#0D1B3E] dark:text-white" />
              <span className="text-sm font-medium text-[#0D1B3E] dark:text-white">
                Trusted by industry leaders
              </span>
            </div>
            <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400">
              Professionals from the UK&apos;s top firms use BUKZ to hire, learn, and stay informed.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {firms.map((firm) => (
              <div
                key={firm.name}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 py-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5 dark:border-[#2a2d3e] dark:bg-[#181b28]"
              >
                <span className="text-lg font-bold text-[#0D1B3E] transition-colors duration-300 group-hover:text-[#C9A84C] dark:text-white">
                  {firm.name}
                </span>
                <span className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {firm.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/10 px-4 py-1.5">
            <Star size={12} className="fill-[#C9A84C] text-[#C9A84C]" />
            <span className="text-sm font-semibold text-[#C9A84C]">Testimonials</span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-bold text-[#0D1B3E] dark:text-white sm:text-4xl lg:text-5xl">
            Trusted by thousands of finance professionals
          </h2>
          <p className="mt-5 mx-auto max-w-xl text-lg text-slate-500 dark:text-slate-400">
            See what our members say about their experience with BUKZ.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#2a2d3e] dark:bg-[#181b28]"
            >
              <div className="mb-5 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={index} size={14} className="fill-[#C9A84C] text-[#C9A84C]" />
                ))}
              </div>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-[#2a2d3e]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D1B3E] shadow-md ring-2 ring-white">
                  <span className="text-sm font-bold text-white">{item.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D1B3E] dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {item.role} &middot; {item.firm}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0D1B3E] dark:bg-[#0a0c14]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Qualifications',
                desc: 'Every candidate’s ACA, ACCA, CIMA or AAT status is verified before listing.',
              },
              {
                icon: Clock,
                title: 'CPD Tracking Built In',
                desc: 'Automatically log and report your continuing professional development hours.',
              },
              {
                icon: TrendingUp,
                title: 'Career Intelligence',
                desc: 'Salary benchmarker, skills gap analysis, and market insights updated weekly.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group flex flex-col items-center text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] transition-all duration-300 group-hover:border-[#C9A84C]/20 group-hover:bg-[#C9A84C]/10">
                    <Icon size={22} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0D1B3E]/5 px-4 py-1.5 dark:bg-white/5">
            <CheckCircle2 size={12} className="text-[#0D1B3E] dark:text-white" />
            <span className="text-sm font-semibold text-[#0D1B3E] dark:text-white">
              How It Works
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-bold text-[#0D1B3E] dark:text-white sm:text-4xl">
            Get started in minutes
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Create your profile',
              desc: 'Sign up and verify your qualifications. Takes under 2 minutes.',
            },
            {
              step: '02',
              title: 'Explore opportunities',
              desc: 'Browse jobs, enrol in courses, and access tools tailored to your level.',
            },
            {
              step: '03',
              title: 'Advance your career',
              desc: 'Apply to roles, earn CPD certificates, and track your growth.',
            },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D1B3E] shadow-lg shadow-[#0D1B3E]/20">
                <span className="text-lg font-bold text-[#C9A84C]">{item.step}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0D1B3E] dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center sm:p-20"
          style={{
            backgroundImage: "url('/images/hero-gradient-mesh.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-[#0D1B3E]/80" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to take the next step?
            </h2>
            <p className="mt-5 mx-auto max-w-xl text-lg leading-relaxed text-slate-300/90">
              Join 15,000+ accounting professionals already using BUKZ to advance their
              careers.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register" className="btn-accent px-8">
                Create free account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/employers/post-job"
                className="btn-secondary border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.12] dark:border-white/10 dark:bg-white/[0.05]"
              >
                Post a job
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">No credit card required. Free for candidates.</p>
          </div>
        </div>
      </section>
    </main>
  );
}