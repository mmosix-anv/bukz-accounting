import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function GuestHeader() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="rounded-2xl border border-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-200/70 hover:bg-slate-50 hover:text-[#0D1B3E] dark:text-slate-300 dark:hover:border-[#2a2d3e] dark:hover:bg-[#2a2d3e] dark:hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/auth/register"
        className="group inline-flex items-center gap-1.5 rounded-2xl border border-[#C9A84C]/35 bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-[#0D1B3E] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D4B752] hover:shadow-md dark:border-[#C9A84C]/20"
      >
        Get started
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </div>
  );
}
