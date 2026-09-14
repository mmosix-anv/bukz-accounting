import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SiteHeader } from '@/components/nav/site-header';
import { AdminSidebar } from '@/components/nav/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-100">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <div className="sticky top-24">
              <AdminSidebar />
            </div>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
