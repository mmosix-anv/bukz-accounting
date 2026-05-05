import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Shield, Briefcase, GraduationCap } from 'lucide-react';
import { AdminTable, AdminTr, AdminTd, FilterTabs, Pagination } from '../admin-table';
import { getAdminUsers, getAdminUsersCount } from '@/lib/services/admin.service';

export const metadata: Metadata = { title: 'Users | Admin' };

const ROLE_ICONS = { candidate: User, employer: Briefcase, instructor: GraduationCap, admin: Shield } as const;
const ROLE_COLOURS = {
  candidate: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  employer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  instructor: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  admin: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
} as const;

const PAGE_SIZE = 20;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string; page?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') redirect('/dashboard');

  const params = await searchParams;
  const roleFilter = params.role ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const [rawUsers, count] = await Promise.all([
    getAdminUsers(roleFilter || undefined, PAGE_SIZE, offset),
    getAdminUsersCount(roleFilter || undefined),
  ]);
  const users = rawUsers.map((u) => ({
    ...u, createdAt: u.createdAt.toISOString(),
  }));
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const filterOptions = [
    { value: '', label: 'All' },
    { value: 'candidate', label: 'Candidates' },
    { value: 'employer', label: 'Employers' },
    { value: 'instructor', label: 'Instructors' },
    { value: 'admin', label: 'Admins' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2a2e] dark:text-white">Users</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{count ?? 0} total accounts</p>
        </div>
        <FilterTabs
          options={filterOptions}
          current={roleFilter}
          buildHref={(v) => `/admin/users${v ? `?role=${v}` : ''}`}
        />
      </div>

      <AdminTable
        columns={[
          { key: 'user', label: 'User' },
          { key: 'role', label: 'Role' },
          { key: 'joined', label: 'Joined' },
          { key: 'actions', label: 'Actions', align: 'right' },
        ]}
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => `/admin/users?page=${p}${roleFilter ? `&role=${roleFilter}` : ''}`}
          />
        }
      >
        {users?.map((u) => {
          const Icon = ROLE_ICONS[u.role as keyof typeof ROLE_ICONS] ?? User;
          return (
            <AdminTr key={u.id}>
              <AdminTd>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-[#0B2430]">
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarUrl} alt="" className="h-8 w-8 object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {(u.name ?? u.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#0f2a2e] dark:text-slate-100">{u.name ?? 'Unnamed'}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </div>
                </div>
              </AdminTd>
              <AdminTd>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLOURS[u.role as keyof typeof ROLE_COLOURS] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Icon size={11} />
                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                </span>
              </AdminTd>
              <AdminTd className="text-slate-500 dark:text-slate-400">
                {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </AdminTd>
              <AdminTd align="right">
                <a href={`/admin/users/${u.id}`} className="text-sm font-medium text-[#2cd7f2] hover:text-[#B8943A]">
                  Edit
                </a>
              </AdminTd>
            </AdminTr>
          );
        })}
      </AdminTable>
    </div>
  );
}
