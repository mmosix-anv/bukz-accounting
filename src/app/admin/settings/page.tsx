import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPublicPricingSettings } from '@/lib/services/settings.service';
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

  const settings = await getPublicPricingSettings();

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