import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MobileMenu } from './mobile-menu';

export function GuestHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/auth/login"
          className="rounded-2xl border border-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-200/70 hover:bg-slate-50 hover:text-[#0f2a2e]"
        >
          Log in
        </Link>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-1.5 rounded-2xl border border-[#2cd7f2]/35 bg-[#2cd7f2] px-4 py-2.5 text-sm font-semibold text-[#0f2a2e] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1bc6e2] hover:shadow-md"
        >
          Book a Strategy Call
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>
      <MobileMenu role="guest" />
    </div>
  );
}
