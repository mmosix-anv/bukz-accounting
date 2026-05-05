import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { db } from '@/lib/db';
import { settingsAuditLog } from '@bukz/db';
import { desc, eq } from 'drizzle-orm';

export const metadata: Metadata = { title: 'Admin - Settings Audit Log' };

interface AuditEntry {
  id: string;
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string | null;
  reason: string | null;
  createdAt: Date;
}

export default async function AdminSettingsAuditPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const page = parseInt(searchParams['page'] ?? '1', 10);
  const limit = 25;
  const offset = (page - 1) * limit;
  const settingKey = searchParams['settingKey'];

  const query = db.select().from(settingsAuditLog)
    .orderBy(desc(settingsAuditLog.createdAt))
    .limit(limit)
    .offset(offset);

  const entries: AuditEntry[] = settingKey
    ? await query.where(eq(settingsAuditLog.settingKey, settingKey))
    : await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings audit log</h1>
          <p className="mt-1 text-sm text-slate-500">All platform setting changes, newest first.</p>
        </div>
        <Link href="/admin/settings" className="text-sm text-primary hover:underline">
          Back to settings
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-3 font-semibold text-slate-700">Setting key</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Changed at</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Reason</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Old value</th>
              <th className="px-4 py-3 font-semibold text-slate-700">New value</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No audit entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{entry.settingKey}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {entry.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{entry.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <pre className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">
                      {JSON.stringify(entry.oldValue)}
                    </pre>
                  </td>
                  <td className="px-4 py-3">
                    <pre className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-800">
                      {JSON.stringify(entry.newValue)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4">
        {page > 1 && (
          <Link
            href={`/admin/settings/audit?page=${page - 1}${settingKey ? `&settingKey=${settingKey}` : ''}`}
            className="text-sm text-primary hover:underline"
          >
            Previous
          </Link>
        )}
        {entries.length === limit && (
          <Link
            href={`/admin/settings/audit?page=${page + 1}${settingKey ? `&settingKey=${settingKey}` : ''}`}
            className="text-sm text-primary hover:underline"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
