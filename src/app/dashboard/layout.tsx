import { SiteHeader } from '@/components/nav/site-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="surface-shell min-h-screen">{children}</main>
    </>
  );
}
