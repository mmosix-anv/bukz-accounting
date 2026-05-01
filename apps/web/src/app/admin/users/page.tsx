import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { User, Shield, Briefcase, GraduationCap } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Users' };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const roleFilter = params.role ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('users').select('id, email, name, role, avatar_url, created_at', { count: 'exact' });

  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }

  const { data: users, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const roleIcons = {
    candidate: User,
    employer: Briefcase,
    instructor: GraduationCap,
    admin: Shield,
  };

  const roleColors = {
    candidate: 'bg-blue-100 text-blue-700',
    employer: 'bg-emerald-100 text-emerald-700',
    instructor: 'bg-purple-100 text-purple-700',
    admin: 'bg-amber-100 text-amber-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Users</h1>
          <p className="mt-1 text-sm text-slate-500">{count ?? 0} total users</p>
        </div>
        <div className="flex gap-2">
          {['', 'candidate', 'employer', 'instructor', 'admin'].map((role) => (
            <a
              key={role}
              href={`/admin/users${role ? `?role=${role}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
            </a>
          ))}
        </div>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((u) => {
                const Icon = roleIcons[u.role as keyof typeof roleIcons] ?? User;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                          ) : (
                            <User className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-primary">{u.name ?? 'Unnamed'}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role as keyof typeof roleColors] ?? 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sm font-medium text-accent hover:text-accent/80">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/admin/users?page=${page - 1}${roleFilter ? `&role=${roleFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/users?page=${page + 1}${roleFilter ? `&role=${roleFilter}` : ''}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}