import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader } from '@/components/nav/site-header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}