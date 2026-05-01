import { SiteHeader } from '@/components/nav/site-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">{children}</main>
    </>
  );
}
