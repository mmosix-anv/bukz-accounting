import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { InsightClient } from './insight-client';

export const metadata: Metadata = {
  title: 'Accounting & Finance Insight | BUKZ',
  description: 'Expert analysis, guides, and news for UK accounting and finance professionals.',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  readTimeMinutes: number | null;
  publishedAt: string | null;
  viewCount: number | null;
}

export default async function InsightPage() {
  const articles = await apiFetch<Article[]>('/insight/articles?limit=21&featuredFirst=true').catch(() => [] as Article[]);

  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  const categories = ['All', 'Tax & HMRC', 'VAT', 'Payroll', 'MTD', 'Career Advice', 'Software'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-primary">BUKZ Insight</h1>
        <p className="mt-2 text-slate-600">Expert analysis and guidance for UK accounting professionals</p>
      </div>

      {featured ? (
        <Link href={`/insight/${featured.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-60 md:h-auto bg-primary/10">
              {featured.coverImageUrl ? (
                <Image src={featured.coverImageUrl} alt={featured.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl">📰</div>
              )}
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                Featured
              </span>
            </div>
            <div className="flex flex-col justify-center p-8">
              {featured.categoryId && (
                <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                  {featured.categoryId}
                </span>
              )}
              <h2 className="text-2xl font-bold text-primary group-hover:text-accent transition-colors leading-snug">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="mt-3 text-slate-600 line-clamp-3">{featured.excerpt}</p>
              )}
              <p className="mt-4 text-xs text-slate-400">
                {featured.readTimeMinutes ? `${featured.readTimeMinutes} min read · ` : ''}
                {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      <InsightClient articles={rest} categories={categories} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 border-t border-slate-100 pt-8">
        <Link href="/tools/tax-calculator" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-sm transition-all">
          <span className="text-3xl">🧮</span>
          <div>
            <p className="font-semibold text-primary">Tax Calculator</p>
            <p className="text-sm text-slate-500">2025/26 UK tax bands (GBP)</p>
          </div>
        </Link>
        <Link href="/tools/ir35-checker" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-sm transition-all">
          <span className="text-3xl">✅</span>
          <div>
            <p className="font-semibold text-primary">IR35 Checker</p>
            <p className="text-sm text-slate-500">15-question assessment</p>
          </div>
        </Link>
        <Link href="/tools/salary-benchmarker" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-sm transition-all">
          <span className="text-3xl">📊</span>
          <div>
            <p className="font-semibold text-primary">Salary Benchmarker</p>
            <p className="text-sm text-slate-500">Compare your salary in GBP</p>
          </div>
        </Link>
      </div>

      <NewsletterSignup />
    </div>
  );
}

function NewsletterSignup() {
  return (
    <div className="rounded-2xl bg-primary px-8 py-10 text-center">
      <h2 className="text-2xl font-bold text-white">Stay ahead of the curve</h2>
      <p className="mt-2 text-slate-300 text-sm">
        Weekly digest of the most important accounting news, HMRC updates, and career advice — delivered to your inbox.
      </p>
      <form className="mt-6 flex max-w-md mx-auto gap-3" action="#" method="POST">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="flex-1 rounded-md border-0 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-500">No spam. Unsubscribe any time.</p>
    </div>
  );
}
