import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArticleForm } from '../../article-form';

export const metadata: Metadata = { title: 'Edit Article | Admin' };

interface Article {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string | null; category_id: string | null; status: string;
}

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const articles = await apiFetch<Article[]>(`/insight/articles?limit=1`, { token }).catch(() => null);
  const article = await supabase.from('articles').select('*').eq('id', params.id).single().then(({ data }) => data);
  if (!article) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/articles" className="text-sm text-slate-400 hover:text-primary">← Back to articles</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Edit article</h1>
      </div>
      <ArticleForm token={token} article={{
        id: article.id, title: article.title, slug: article.slug,
        excerpt: article.excerpt, content: article.content, categoryId: article.category_id,
        status: article.status,
      }} />
    </div>
  );
}
