'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, Briefcase, GraduationCap, FileText, UserCheck, CreditCard, Settings } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/experts', label: 'Experts', icon: UserCheck },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav className="flex flex-wrap gap-1.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
              active
                ? 'bg-white text-[#0D1B3E] shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
