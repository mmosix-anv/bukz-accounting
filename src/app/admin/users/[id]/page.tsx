import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAdminUserById } from '@/lib/services/admin.service';
import { UserEditForm } from './user-edit-form';

export const metadata: Metadata = { title: 'Edit User | Admin' };

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  const [{ data: { user: authUser } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!authUser || authUser.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  const { id } = await params;
  const userData = await getAdminUserById(id).catch(() => null);
  if (!userData) notFound();

  const serialised = {
    ...userData,
    createdAt: userData.createdAt.toISOString(),
    enrollments: userData.enrollments.map((e) => ({
      ...e,
      completedAt: e.completedAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    applications: userData.applications.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    payments: userData.payments.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-slate-500 hover:text-[#0f2a2e]">
          ← Back to Users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#0f2a2e]">Edit User</h1>
      </div>
      <UserEditForm user={serialised} token={session?.access_token} />
    </div>
  );
}
