import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArticleForm } from '../article-form';

export const metadata: Metadata = { title: 'New Article | Admin' };

export default async function NewArticlePage() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/articles" className="text-sm text-slate-400 hover:text-primary">← Back to articles</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">New article</h1>
      </div>
      <ArticleForm />
    </div>
  );
}
