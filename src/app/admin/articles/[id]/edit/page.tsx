import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articles } from '@bukz/db';
import { ArticleForm } from '../../article-form';

export const metadata: Metadata = { title: 'Edit Article | Admin' };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const [article] = await db.select().from(articles).where(eq(articles.id, params.id)).limit(1);
  if (!article) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/articles" className="text-sm text-slate-400 hover:text-primary">← Back to articles</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Edit article</h1>
      </div>
      <ArticleForm article={{
        id: article.id, title: article.title, slug: article.slug,
        excerpt: article.excerpt, content: article.content, categoryId: article.categoryId ?? undefined,
        status: article.status,
      }} />
    </div>
  );
}
