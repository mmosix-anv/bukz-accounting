'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, ArrowRight } from 'lucide-react';

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

interface Props {
  articles: Article[];
  categories: string[];
}

export function InsightClient({ articles, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.categoryId === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-[#0f2a2e] text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:border-[#2cd7f2]/40 hover:text-[#2cd7f2] hover:bg-[#2cd7f2]/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
            <FileText size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No articles found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Link
      href={`/insight/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative h-48 bg-slate-100 dark:bg-[#0F2228] flex items-center justify-center overflow-hidden">
        {article.featuredImageUrl ? (
          <Image src={article.featuredImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <FileText size={24} className="text-primary/60" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-6">
        {article.categoryId && (
          <span className="mb-3 inline-block self-start rounded-full bg-[#2cd7f2]/10 border border-[#2cd7f2]/15 px-2.5 py-0.5 text-xs font-semibold text-[#2cd7f2]">
            {article.categoryId}
          </span>
        )}
        <h3 className="font-semibold text-primary leading-snug group-hover:text-[#2cd7f2] transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {date && <span>{date}</span>}
          </div>
          <ArrowRight size={14} className="text-slate-300 group-hover:text-[#2cd7f2] group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </Link>
  );
}
