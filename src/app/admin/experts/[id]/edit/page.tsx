import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ExpertForm } from '../../expert-form';

export const metadata: Metadata = { title: 'Edit Expert | Admin' };

export default async function EditExpertPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const { data: expert } = await supabase
    .from('experts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!expert) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/experts" className="text-sm text-slate-400 hover:text-primary">← Back to experts</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Edit expert</h1>
      </div>
      <ExpertForm token={token} expert={{
        id: expert.id,
        name: expert.name,
        title: expert.title,
        bio: expert.bio,
        specialisations: expert.specialisations ?? [],
        qualifications: expert.qualifications ?? [],
        hourlyRateGbp: expert.hourly_rate_gbp,
        calUsername: expert.cal_username,
        isVerified: expert.is_verified,
        isActive: expert.is_active,
      }} />
    </div>
  );
}
