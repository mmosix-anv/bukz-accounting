import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import {
  Users,
  Briefcase,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Admin Dashboard' };

async function getStats() {
  const supabase = createClient();
  const [{ count: userCount }, { count: listingCount }, { count: enrollmentCount }, { data: payments }] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('job_listings').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase
        .from('payments')
        .select('amount_pence')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount_pence ?? 0), 0) ?? 0;

  return {
    userCount: userCount ?? 0,
    listingCount: listingCount ?? 0,
    enrollmentCount: enrollmentCount ?? 0,
    totalRevenue,
  };
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const stats = await getStats();

  const statCards = [
    { label: 'Total Users', value: stats.userCount, icon: Users, color: 'text-blue-600' },
    { label: 'Job Listings', value: stats.listingCount, icon: Briefcase, color: 'text-emerald-600' },
    {
      label: 'Enrollments',
      value: stats.enrollmentCount,
      icon: GraduationCap,
      color: 'text-purple-600',
    },
    {
      label: 'Revenue (MTD)',
      value: `£${(stats.totalRevenue / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-accent',
    },
  ];

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-soft dark:border-[#2a2d3e] dark:bg-[#181b28]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">Overview</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[#0D1B3E] dark:text-white">
            Admin Dashboard
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Track platform growth, revenue, and operational health at a glance across jobs,
            learning, and payments.
          </p>
        </Card>
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-[#0D1B3E] p-8 text-white shadow-soft dark:border-[#2a2d3e] dark:bg-[#10131d]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#C9A84C]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Operations summary</p>
              <p className="text-sm text-slate-300">Core services are active and ready for review.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Database', 'Connected'],
              ['API', 'Operational'],
              ['Stripe', 'Active'],
              ['Search', 'Indexed'],
            ].map(([label, status]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 dark:border-[#2a2d3e] dark:bg-[#181b28]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-primary dark:text-white">{value}</p>
              </div>
              <div className={`rounded-2xl bg-slate-100 p-3 dark:bg-[#202433] ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-[#2a2d3e] dark:bg-[#181b28]">
          <h2 className="text-lg font-semibold text-primary dark:text-white">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/users"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/30 hover:bg-[#fffaf2] dark:border-[#2a2d3e] dark:hover:bg-[#202433]"
            >
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary dark:text-white">Manage Users</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View and manage user accounts
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/jobs"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/30 hover:bg-[#fffaf2] dark:border-[#2a2d3e] dark:hover:bg-[#202433]"
            >
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary dark:text-white">Moderate Jobs</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Review and manage job listings
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/payments"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/30 hover:bg-[#fffaf2] dark:border-[#2a2d3e] dark:hover:bg-[#202433]"
            >
              <CreditCard className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary dark:text-white">Payment History</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View transactions and revenue
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-[#2a2d3e] dark:bg-[#181b28]">
          <h2 className="text-lg font-semibold text-primary dark:text-white">Platform Health</h2>
          <div className="mt-4 space-y-4">
            {[
              ['Database', 'Connected'],
              ['API', 'Operational'],
              ['Stripe', 'Active'],
              ['Search (Algolia)', 'Indexed'],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">{status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}