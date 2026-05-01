import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Payments' };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const pageSize = 30;
  const offset = (page - 1) * pageSize;

  const { data: payments, count } = await supabase
    .from('payments')
    .select('id, amount_pence, currency, status, description, created_at, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data: users } = await supabase
    .from('users')
    .select('id, email, name');

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
    completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-primary">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">{count ?? 0} transactions</p>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments?.map((payment) => {
                const userInfo = userMap.get(payment.user_id);
                const config = statusConfig[payment.status] ?? { color: 'bg-slate-100 text-slate-700', icon: Clock };
                const Icon = config.icon;

                return (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-primary">{userInfo?.name ?? 'Unknown'}</p>
                        <p className="text-sm text-slate-500">{userInfo?.email ?? payment.user_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {payment.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary">
                        {payment.currency?.toUpperCase() === 'GBP' ? '£' : payment.currency?.toUpperCase() ?? '£'}
                        {(payment.amount_pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config?.color ?? 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="h-3 w-3" />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
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
                <a href={`/admin/payments?page=${page - 1}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/payments?page=${page + 1}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
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