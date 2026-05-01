import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function GuestHeader() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0D1B3E] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#2a2d3e] transition-all duration-200"
      >
        Log in
      </Link>
      <Link
        href="/auth/register"
        className="group inline-flex items-center gap-1.5 rounded-lg bg-[#0D1B3E] dark:bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#0D1B3E] hover:bg-[#1F2E62] dark:hover:bg-[#D4B752] shadow-sm hover:shadow-md transition-all duration-200"
      >
        Get started
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </div>
  );
}
