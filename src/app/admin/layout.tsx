import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/nav/site-header';
import { AdminNav } from './admin-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-200 bg-[#0f2a2e] dark:border-[#1e2133] dark:bg-[#0e1020]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2cd7f2]">Admin</p>
              <h1 className="mt-0.5 text-lg font-semibold text-white">Platform control centre</h1>
            </div>
            <AdminNav />
          </div>
        </div>
      </div>
      <main className="min-h-screen bg-slate-50 dark:bg-[#0A1A20]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
