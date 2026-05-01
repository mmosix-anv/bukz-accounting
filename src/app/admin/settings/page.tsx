import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type {
  EmployerSubscriptionTierSetting,
  JobPostingPackageSetting,
} from '@bukz/db';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Admin - Settings' };

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    redirect('/dashboard');
  }

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_URL'] ?? 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/v1/admin/settings/pricing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ['platform-settings'] },
  });

  if (!response.ok) {
    throw new Error('Could not load settings');
  }

  const settings = await response.json() as {
    employerSubscriptionTiers: EmployerSubscriptionTierSetting[];
    jobPostingPackages: JobPostingPackageSetting[];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Platform settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage pricing and listing limits without changing code.
        </p>
      </div>

      <SettingsForm
        initialEmployerSubscriptionTiers={settings.employerSubscriptionTiers}
        initialJobPostingPackages={settings.jobPostingPackages}
        token={token}
      />
    </div>
  );
}