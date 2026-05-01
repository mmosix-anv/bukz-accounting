import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { AuthedHeader } from './authed-header';
import { GuestHeader } from './guest-header';
import { ColorSchemeToggle } from './color-scheme-toggle';

const navLinks = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/learn', label: 'Learn' },
  { href: '/insight', label: 'Insight' },
  { href: '/experts', label: 'Experts' },
];

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-[#2a2d3e] dark:bg-[#10131d]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-mark.svg"
              alt="BUKZ"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-[#0D1B3E] dark:text-white">
                BUKZ
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-[#9A7A2C] dark:text-[#C9A84C] sm:inline">
                Accounting
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0D1B3E] dark:text-slate-400 dark:hover:bg-[#1e2130] dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ColorSchemeToggle />
          {user ? <AuthedHeader user={user} /> : <GuestHeader />}
        </div>
      </div>
    </header>
  );
}
