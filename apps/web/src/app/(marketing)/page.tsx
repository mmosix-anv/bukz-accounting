import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Users, BookOpen, Award, TrendingUp, Building2, Shield, Clock, Star, CheckCircle2, Sparkles } from 'lucide-react';

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
    gradient: 'from-blue-500/10 to-indigo-500/10',
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
    gradient: 'from-emerald-500/10 to-teal-500/10',
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
    gradient: 'from-amber-500/10 to-orange-500/10',
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
    quote: 'BUKZ connected me with my dream role in under two weeks. The qualification-specific filtering saved me hours of searching.',
    name: 'Sarah Mitchell',
    role: 'Senior Tax Manager',
    firm: 'Grant Thornton',
    avatar: '/images/avatar-sarah.jpg',
    rating: 5,
  },
  {
    quote: 'The CPD courses are genuinely useful — not just box-ticking. I completed my ICAEW requirement entirely through BUKZ Learn.',
    name: 'James Crawford',
    role: 'Audit Manager',
    firm: 'Mid-tier practice',
    avatar: '/images/avatar-james.jpg',
    rating: 5,
  },
  {
    quote: 'As a hiring manager, the quality of candidates through BUKZ is unmatched. Every applicant has verified qualifications.',
    name: 'Rachel Nguyen',
    role: 'Finance Director',
    firm: 'FTSE 250 company',
    avatar: '/images/avatar-rachel.jpg',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#0D1B3E] overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-gradient-mesh.svg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 line-pattern" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B3E]/20 via-transparent to-[#0D1B3E]/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 mb-8 backdrop-blur-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm text-slate-300 font-medium">2,500+ roles live now</span>
              <Sparkles size={12} className="text-[#C9A84C]" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight animate-fade-in-up stagger-1">
              The UK&apos;s Specialist Platform for{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#C9A84C] via-[#E8D595] to-[#C9A84C] bg-clip-text text-transparent">
                  Accounting &amp; Finance
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Find your next role, earn CPD-accredited qualifications, and access expert insight — all in one platform built exclusively for finance professionals.
            </p>

            {/* Search Bar */}
            <div className="mt-12 max-w-3xl mx-auto animate-fade-in-up stagger-3">
              <form className="relative flex flex-col sm:flex-row gap-3 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] p-3 shadow-2xl shadow-black/20">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Job title, skill or keyword"
                    className="w-full rounded-xl bg-white pl-11 pr-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 shadow-sm"
                  />
                </div>
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input
                    type="text"
                    placeholder="City or postcode"
                    className="w-full rounded-xl bg-white pl-11 pr-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 shadow-sm"
                  />
                </div>
                <Link
                  href="/jobs"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#B8943A] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/35 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#D4B752] hover:to-[#C9A84C]"
                >
                  <Search size={16} />
                  Search Jobs
                </Link>
              </form>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-500">Popular:</span>
                {['Management Accountant', 'Tax Advisor', 'Finance Director', 'Audit Senior'].map((term) => (
                  <Link
                    key={term}
                    href={`/jobs?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400 hover:text-white hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 transition-all duration-200"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group relative rounded-2xl bg-white border border-slate-100 p-6 sm:p-8 text-center shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D1B3E]/5 group-hover:bg-[#C9A84C]/10 transition-all duration-300 group-hover:scale-110">
                    <Icon size={20} className="text-[#0D1B3E] group-hover:text-[#C9A84C] transition-colors duration-300" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0D1B3E] tracking-tight">{stat.value}</p>
                  <p className="mt-1.5 text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pillars Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/10 px-4 py-1.5 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-sm font-semibold text-[#C9A84C]">Our Platform</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1B3E] text-balance leading-tight">
              Everything you need to advance your finance career
            </h2>
            <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Three integrated pillars designed specifically for UK accounting and finance professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar) => (
              <Link
                key={pillar.title}
                href={pillar.href}
                className={`group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 lg:p-10 hover:border-[#C9A84C]/30 hover:shadow-2xl hover:shadow-[#C9A84C]/[0.06] transition-all duration-500 hover:-translate-y-1 ${pillar.accentBorder}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#0D1B3E] to-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-8">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-[#0D1B3E]/[0.03] p-2 group-hover:scale-105 transition-transform duration-300">
                      <Image src={pillar.icon} alt="" width={64} height={64} />
                    </div>
                    <span className="text-right">
                      <span className="block text-3xl font-bold text-[#0D1B3E] tracking-tight">{pillar.stat}</span>
                      <span className="text-xs text-slate-400 font-medium">{pillar.statLabel}</span>
                    </span>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-2">
                    {pillar.subtitle}
                  </p>
                  <h3 className="text-xl font-bold text-[#0D1B3E] mb-4 group-hover:text-[#C9A84C] transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">
                    {pillar.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0D1B3E] group-hover:text-[#C9A84C] transition-colors duration-300">
                    {pillar.cta}
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative border-y border-slate-100 bg-slate-50/80">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 mb-4 shadow-sm">
              <Building2 size={14} className="text-[#0D1B3E]" />
              <span className="text-sm font-medium text-[#0D1B3E]">Trusted by industry leaders</span>
            </div>
            <p className="text-slate-500 max-w-md mx-auto">
              Professionals from the UK&apos;s top firms use BUKZ to hire, learn, and stay informed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {firms.map((firm) => (
              <div
                key={firm.name}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white py-7 px-4 hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-lg font-bold text-[#0D1B3E] group-hover:text-[#C9A84C] transition-colors duration-300">{firm.name}</span>
                <span className="mt-1.5 text-xs text-slate-400 font-medium">{firm.tier}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/10 px-4 py-1.5 mb-4">
            <Star size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
            <span className="text-sm font-semibold text-[#C9A84C]">Testimonials</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1B3E] text-balance">
            Trusted by thousands of finance professionals
          </h2>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
            See what our members say about their experience with BUKZ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#C9A84C] fill-[#C9A84C]" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-8 flex items-center gap-3 pt-6 border-t border-slate-100">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#0D1B3E] to-[#5A729F] flex items-center justify-center ring-2 ring-white shadow-md">
                  <span className="text-sm font-bold text-white">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D1B3E]">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} &middot; {t.firm}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features/Benefits Strip */}
      <section className="relative bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-dark" />
        <div className="absolute inset-0 line-pattern" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Qualifications',
                desc: 'Every candidate\u2019s ACA, ACCA, CIMA or AAT status is verified before listing.',
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
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] group-hover:bg-[#C9A84C]/10 group-hover:border-[#C9A84C]/20 transition-all duration-300">
                    <Icon size={22} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xs">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0D1B3E]/5 px-4 py-1.5 mb-4">
            <CheckCircle2 size={12} className="text-[#0D1B3E]" />
            <span className="text-sm font-semibold text-[#0D1B3E]">How It Works</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#0D1B3E]">
            Get started in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Create your profile', desc: 'Sign up and verify your qualifications. Takes under 2 minutes.' },
            { step: '02', title: 'Explore opportunities', desc: 'Browse jobs, enrol in courses, and access tools tailored to your level.' },
            { step: '03', title: 'Advance your career', desc: 'Apply to roles, earn CPD certificates, and track your growth.' },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1B3E] to-[#1F2E62] mb-5 shadow-lg shadow-[#0D1B3E]/20">
                <span className="text-lg font-bold text-[#C9A84C]">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0D1B3E] mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B3E] via-[#1F2E62] to-[#0D1B3E] p-12 sm:p-20 text-center">
          <div className="absolute inset-0">
            <Image src="/images/hero-gradient-mesh.svg" alt="" fill className="object-cover opacity-40" />
          </div>
          <div className="absolute inset-0 line-pattern opacity-50" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
              Ready to take the next step?
            </h2>
            <p className="mt-5 text-lg text-slate-300/90 max-w-xl mx-auto leading-relaxed">
              Join 15,000+ accounting professionals already using BUKZ to advance their careers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#B8943A] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Create free account
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/employers/post-job"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
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
