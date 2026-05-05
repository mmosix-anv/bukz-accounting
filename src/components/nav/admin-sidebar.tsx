'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  FileText,
  UserCheck,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  Tag,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/experts', label: 'Experts', icon: UserCheck },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const path = usePathname();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      {/* Panel Header */}
      <div className="mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#2cd7f2]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? path === item.href
            : path.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#0f2a2e] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f2a2e]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-[#0f2a2e]"
        >
          <LayoutDashboard size={18} />
          View Site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut size={18} />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
