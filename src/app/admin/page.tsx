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
import { getAdminStats } from '@/lib/services/admin.service';
import { getHealthCheck, type HealthCheckResult } from '@/lib/services/health.service';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const [stats, health] = await Promise.all([
    getAdminStats(),
    getHealthCheck(),
  ]);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
    { label: 'Job Listings', value: stats.totalListings, icon: Briefcase, color: 'text-emerald-600' },
    {
      label: 'Enrollments',
      value: stats.totalEnrollments,
      icon: GraduationCap,
      color: 'text-purple-600',
    },
    {
      label: 'Revenue (MTD)',
      value: `£${(stats.mtdRevenue / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-accent',
    },
  ];
  const healthLabels: Record<keyof HealthCheckResult['checks'], string> = {
    database: 'Database',
    stripe: 'Stripe',
    search: 'Search',
    email: 'Email',
    sentry: 'Sentry',
  };

  const healthStatusLabel = {
    ok: 'Operational',
    missing_config: 'Missing config',
    error: 'Error',
  } satisfies Record<HealthCheckResult['checks'][keyof HealthCheckResult['checks']], string>;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2cd7f2]">Overview</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[#0f2a2e]">
            Admin Dashboard
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Track platform growth, revenue, and operational health at a glance across jobs,
            learning, and payments.
          </p>
        </Card>
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-[#0f2a2e] p-8 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#2cd7f2]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Operations summary</p>
              <p className="text-sm text-slate-300">
                Platform status is {health.status === 'ok' ? 'operational' : 'degraded'}.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(health.checks).slice(0, 4).map(([key, status]) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {healthLabels[key as keyof HealthCheckResult['checks']]}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{healthStatusLabel[status]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
              </div>
              <div className={`rounded-2xl bg-slate-100 p-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/users"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30 hover:bg-[#fffaf2]"
            >
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Manage Users</p>
                <p className="text-sm text-slate-500">
                  View and manage user accounts
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/jobs"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30 hover:bg-[#fffaf2]"
            >
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Moderate Jobs</p>
                <p className="text-sm text-slate-500">
                  Review and manage job listings
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/payments"
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2cd7f2]/30 hover:bg-[#fffaf2]"
            >
              <CreditCard className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Payment History</p>
                <p className="text-sm text-slate-500">
                  View transactions and revenue
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-primary">Platform Health</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(health.checks).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${status === 'ok' ? 'bg-emerald-500' : status === 'missing_config' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-slate-600">
                    {healthLabels[key as keyof HealthCheckResult['checks']]}
                  </span>
                </div>
                <span className={`text-sm font-medium ${status === 'ok' ? 'text-emerald-600' : status === 'missing_config' ? 'text-amber-600' : 'text-red-600'}`}>
                  {healthStatusLabel[status]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}