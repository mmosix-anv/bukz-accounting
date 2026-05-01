import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Experts' };

export default async function AdminExpertsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const { data: experts } = await supabase
    .from('experts')
    .select('id, name, title, specialisations, is_verified, is_active, hourly_rate_gbp, cal_username')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Experts</h1>
          <p className="mt-1 text-sm text-slate-500">{experts?.length ?? 0} experts</p>
        </div>
        <a href="/admin/experts/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          + Add expert
        </a>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Expert</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Specialisations</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {experts?.map((expert) => (
                <tr key={expert.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{expert.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {expert.title}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {expert.specialisations?.slice(0, 3).map((spec: string, i: number) => (
                        <span key={i} className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {spec}
                        </span>
                      ))}
                      {(expert.specialisations?.length ?? 0) > 3 && (
                        <span className="text-xs text-slate-500">+{(expert.specialisations?.length ?? 0) - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {expert.hourly_rate_gbp ? `£${Number(expert.hourly_rate_gbp).toFixed(0)}/hr` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {expert.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          <XCircle className="h-3 w-3" /> Unverified
                        </span>
                      )}
                      {!expert.is_active && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {expert.cal_username && (
                        <a href={`/experts/${expert.cal_username}`} className="text-sm font-medium text-accent hover:text-accent/80">
                          View
                        </a>
                      )}
                      <a href={`/admin/experts/${expert.id}/edit`} className="text-sm font-medium text-slate-500 hover:text-primary">
                        Edit
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
