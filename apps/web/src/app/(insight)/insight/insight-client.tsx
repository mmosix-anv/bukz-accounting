'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">No articles found in this category yet.</p>
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
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative h-44 bg-primary/10 flex items-center justify-center">
        {article.coverImageUrl ? (
          <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" />
        ) : (
          <span className="text-5xl">📰</span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {article.categoryId && (
          <span className="mb-2 inline-block self-start rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {article.categoryId}
          </span>
        )}
        <h3 className="font-semibold text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
        )}
        <p className="mt-auto pt-3 text-xs text-slate-400">
          {article.readTimeMinutes ? `${article.readTimeMinutes} min read` : ''}
          {article.readTimeMinutes && date ? ' · ' : ''}
          {date ?? ''}
        </p>
      </div>
    </Link>
  );
}
