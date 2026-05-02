import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findArticleBySlug } from '@/lib/services/articles.service';
import { ArticleActions } from './article-actions';

const getArticle = cache(findArticleBySlug);

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug);
    return {
      title: `${article.title} | BUKZ Insight`,
      description: article.excerpt ?? undefined,
      openGraph: {
        title: article.title,
        description: article.excerpt ?? undefined,
        images: article.featuredImageUrl ? [article.featuredImageUrl] : [],
        type: 'article',
        publishedTime: article.publishedAt?.toISOString() ?? undefined,
      },
    };
  } catch {
    return { title: 'Article not found' };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  let raw: Awaited<ReturnType<typeof getArticle>>;
  try {
    raw = await getArticle(params.slug);
  } catch {
    notFound();
  }

  const date = raw.publishedAt
    ? raw.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const articleUrl = `${process.env['NEXT_PUBLIC_APP_URL'] ?? ''}/insight/${raw.slug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <article>
        <header className="mb-8">
          {raw.categoryId && (
            <Link
              href={`/insight?category=${raw.categoryId}`}
              className="inline-block rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent mb-4 hover:bg-accent/20 transition-colors"
            >
              {raw.categoryId}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-primary leading-tight">{raw.title}</h1>
          {raw.excerpt && (
            <p className="mt-3 text-lg text-slate-600">{raw.excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {date && <span>{date}</span>}
            {raw.viewCount != null && (
              <>
                <span>·</span>
                <span>{raw.viewCount.toLocaleString()} views</span>
              </>
            )}
          </div>
          <ArticleActions articleId={raw.id} articleUrl={articleUrl} title={raw.title} />
        </header>

        {raw.featuredImageUrl && (
          <div className="relative mb-8 h-80 w-full overflow-hidden rounded-xl bg-slate-100">
            <Image src={raw.featuredImageUrl} alt={raw.title} fill className="object-cover" />
          </div>
        )}

        <div
          className="prose prose-slate max-w-none prose-headings:text-primary prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: raw.content ?? '<p>Content coming soon.</p>' }}
        />
      </article>

      <div className="mt-12 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="font-semibold text-primary">Need expert advice on this topic?</p>
        <p className="mt-1 text-sm text-slate-600">Book a consultation with a verified UK accounting specialist.</p>
        <Link
          href="/experts"
          className="mt-4 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Find an expert
        </Link>
      </div>

      <div className="mt-6">
        <Link href="/insight" className="text-sm text-slate-400 hover:text-primary transition-colors">
          ← Back to Insight
        </Link>
      </div>
    </div>
  );
}
