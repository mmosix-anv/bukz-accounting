import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { Eye, Calendar } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Articles' };

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-700',
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const statusFilter = params.status ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('articles')
    .select('id, title, slug, status, view_count, published_at, created_at', { count: 'exact' });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: articles, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">{count ?? 0} articles</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/articles/new"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            + New article
          </a>
          {['', 'published', 'draft'].map((status) => (
            <a
              key={status}
              href={`/admin/articles${status ? `?status=${status}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </a>
          ))}
        </div>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Article</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Published</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles?.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{article.title}</p>
                    <p className="text-sm text-slate-500">/{article.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[article.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Eye className="h-3 w-3" />{article.view_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/insight/${article.slug}`} className="text-sm font-medium text-accent hover:text-accent/80">
                        View
                      </a>
                      <a href={`/admin/articles/${article.id}/edit`} className="text-sm font-medium text-slate-500 hover:text-primary">
                        Edit
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/admin/articles?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/articles?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}