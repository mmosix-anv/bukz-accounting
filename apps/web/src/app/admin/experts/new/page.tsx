import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExpertForm } from '../expert-form';

export const metadata: Metadata = { title: 'New Expert | Admin' };

export default async function NewExpertPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/experts" className="text-sm text-slate-400 hover:text-primary">← Back to experts</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Add expert</h1>
      </div>
      <ExpertForm token={token} />
    </div>
  );
}
