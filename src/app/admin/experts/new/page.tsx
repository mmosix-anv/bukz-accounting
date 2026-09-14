import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ExpertForm } from '../expert-form';

export const metadata: Metadata = { title: 'New Expert | Admin' };

export default async function NewExpertPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin/experts" className="text-sm text-slate-400 hover:text-primary">← Back to experts</a>
        <h1 className="mt-2 text-2xl font-bold text-primary">Add expert</h1>
      </div>
      <ExpertForm />
    </div>
  );
}
