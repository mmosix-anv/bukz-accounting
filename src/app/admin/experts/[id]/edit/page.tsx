import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { experts } from '@bukz/db';
import { ExpertForm } from '../../expert-form';

export const metadata: Metadata = { title: 'Edit Expert | Admin' };

export default async function EditExpertPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const [expert] = await db.select().from(experts).where(eq(experts.id, params.id)).limit(1);
  if (!expert) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/experts" className="text-sm text-slate-400 hover:text-primary">← Back to experts</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Edit expert</h1>
      </div>
      <ExpertForm expert={{
        id: expert.id,
        name: expert.name,
        title: expert.title,
        bio: expert.bio,
        specialisations: expert.specialisations,
        qualifications: expert.qualifications,
        hourlyRateGbp: expert.hourlyRateGbp ?? undefined,
        calUsername: expert.calUsername ?? undefined,
        isVerified: expert.isVerified,
        isActive: expert.isActive,
      }} />
    </div>
  );
}
