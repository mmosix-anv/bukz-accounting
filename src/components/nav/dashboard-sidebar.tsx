'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Award,
  Clock,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string }>;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Jobs',
    items: [
      { href: '/dashboard/applications', label: 'My Applications', icon: Briefcase },
      { href: '/dashboard/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    ],
  },
  {
    title: 'Learning',
    items: [
      { href: '/dashboard/learn', label: 'My Courses', icon: BookOpen },
      { href: '/dashboard/learn/certificates', label: 'Certificates', icon: Award },
      { href: '/dashboard/learn/cpd', label: 'CPD Log', icon: Clock },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const path = usePathname();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      {/* Panel Header */}
      <div className="mb-5 border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? path === item.href
                  : path.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0f2a2e] text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f2a2e]'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-5 border-t border-slate-100 pt-4">
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
