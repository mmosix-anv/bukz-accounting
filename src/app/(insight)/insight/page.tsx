import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Lightbulb, Calculator, CheckSquare, BarChart3, ArrowRight } from 'lucide-react';
import { findAllArticles } from '@/lib/services/articles.service';
import { InsightClient } from './insight-client';

export const metadata: Metadata = {
  title: 'Accounting & Finance Insight | BUKZ',
  description: 'Expert analysis, guides, and news for UK accounting and finance professionals.',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string | null;
  categoryId: string | null;
  publishedAt: string | null;
  viewCount: number;
}

export default async function InsightPage() {
  const rawArticles = await findAllArticles(21).catch(() => []);
  const articles = rawArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    featuredImageUrl: a.featuredImageUrl,
    categoryId: a.categoryId,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    viewCount: a.viewCount,
  }));

  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  const categories = ['All', 'Tax & HMRC', 'VAT', 'Payroll', 'MTD', 'Career Advice', 'Software'];

  return (
    <div className="space-y-0">
      {/* Hero Banner */}
      <div className="relative bg-[#0D1B3E] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/insight-hero.svg" alt="" fill className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-5 backdrop-blur-sm">
              <Lightbulb size={12} className="text-[#C9A84C]" />
              <span className="text-xs font-medium text-slate-300">Expert analysis &amp; tools</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              BUKZ{' '}
              <span className="text-[#C9A84C]">Insight</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300/90 max-w-lg leading-relaxed">
              Expert analysis and guidance for UK accounting professionals
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {featured ? (
          <Link href={`/insight/${featured.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-64 md:h-auto bg-slate-100 dark:bg-[#1a1d2a]">
                {featured.featuredImageUrl ? (
                  <Image src={featured.featuredImageUrl} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                      <Lightbulb size={32} className="text-primary/60" />
                    </div>
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-[#C9A84C] px-3.5 py-1.5 text-xs font-semibold text-[#0D1B3E] shadow-lg shadow-[#C9A84C]/20">
                  Featured
                </span>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                {featured.categoryId && (
                  <span className="mb-3 inline-block self-start rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1 text-xs font-semibold text-[#C9A84C]">
                    {featured.categoryId}
                  </span>
                )}
                <h2 className="text-2xl lg:text-3xl font-bold text-primary group-hover:text-[#C9A84C] transition-colors duration-300 leading-snug">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-4 text-slate-500 line-clamp-3 leading-relaxed">{featured.excerpt}</p>
                )}
                <div className="mt-6 flex items-center gap-4">
                  <p className="text-xs text-slate-400">
                    {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-[#C9A84C] transition-colors">
                    Read article
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        <InsightClient articles={rest} categories={categories} />

        {/* Tools Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-4">
          <Link href="/tools/tax-calculator" className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
              <Calculator size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-primary group-hover:text-[#C9A84C] transition-colors">Tax Calculator</p>
              <p className="text-sm text-slate-500">2025/26 UK tax bands (GBP)</p>
            </div>
          </Link>
          <Link href="/tools/ir35-checker" className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckSquare size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-primary group-hover:text-[#C9A84C] transition-colors">IR35 Checker</p>
              <p className="text-sm text-slate-500">15-question assessment</p>
            </div>
          </Link>
          <Link href="/tools/salary-benchmarker" className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
              <BarChart3 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-primary group-hover:text-[#C9A84C] transition-colors">Salary Benchmarker</p>
              <p className="text-sm text-slate-500">Compare your salary in GBP</p>
            </div>
          </Link>
        </div>

        <NewsletterSignup />
      </div>
    </div>
  );
}

function NewsletterSignup() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0D1B3E] px-8 py-12 text-center">
      <div className="relative">
        <h2 className="text-2xl font-bold text-white">Stay ahead of the curve</h2>
        <p className="mt-3 text-slate-300/90 text-sm max-w-md mx-auto leading-relaxed">
          Weekly digest of the most important accounting news, HMRC updates, and career advice — delivered to your inbox.
        </p>
        <form className="mt-8 flex max-w-md mx-auto gap-3" action="#" method="POST">
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="flex-1 rounded-lg border-0 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 shadow-sm"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#C9A84C] px-6 py-3 text-sm font-semibold text-[#0D1B3E] shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Subscribe
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">No spam. Unsubscribe any time.</p>
      </div>
    </div>
  );
}
