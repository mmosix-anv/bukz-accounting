import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { Users, Briefcase, GraduationCap, TrendingUp, CreditCard, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin Dashboard' };

async function getStats() {
  const supabase = createClient();
  const [{ count: userCount }, { count: listingCount }, { count: enrollmentCount }, { data: payments }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount_pence').eq('status', 'completed').order('created_at', { ascending: false }).limit(30),
  ]);

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount_pence ?? 0), 0) ?? 0;

  return { userCount: userCount ?? 0, listingCount: listingCount ?? 0, enrollmentCount: enrollmentCount ?? 0, totalRevenue };
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const stats = await getStats();

  const statCards = [
    { label: 'Total Users', value: stats.userCount, icon: Users, color: 'text-blue-600' },
    { label: 'Job Listings', value: stats.listingCount, icon: Briefcase, color: 'text-emerald-600' },
    { label: 'Enrollments', value: stats.enrollmentCount, icon: GraduationCap, color: 'text-purple-600' },
    { label: 'Revenue (MTD)', value: `£${(stats.totalRevenue / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Platform overview and management</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
              </div>
              <div className={`rounded-full bg-slate-100 p-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <a href="/admin/users" className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Manage Users</p>
                <p className="text-sm text-slate-500">View and manage user accounts</p>
              </div>
            </a>
            <a href="/admin/jobs" className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Moderate Jobs</p>
                <p className="text-sm text-slate-500">Review and manage job listings</p>
              </div>
            </a>
            <a href="/admin/payments" className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-primary">Payment History</p>
                <p className="text-sm text-slate-500">View transactions and revenue</p>
              </div>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary">Platform Health</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Database</span>
              </div>
              <span className="text-sm font-medium text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">API</span>
              </div>
              <span className="text-sm font-medium text-emerald-600">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Stripe</span>
              </div>
              <span className="text-sm font-medium text-emerald-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Search (Algolia)</span>
              </div>
              <span className="text-sm font-medium text-emerald-600">Indexed</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}