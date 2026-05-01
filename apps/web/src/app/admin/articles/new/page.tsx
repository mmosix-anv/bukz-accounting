import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArticleForm } from '../article-form';

export const metadata: Metadata = { title: 'New Article | Admin' };

export default async function NewArticlePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/articles" className="text-sm text-slate-400 hover:text-primary">← Back to articles</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">New article</h1>
      </div>
      <ArticleForm token={token} />
    </div>
  );
}
