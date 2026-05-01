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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 dark:border-[#2a2d3e] bg-white/85 dark:bg-[#14151e]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#14151e]/70">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/images/logo-mark.svg"
              alt="BUKZ"
              width={32}
              height={32}
              className="rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#0D1B3E] dark:text-white">
                BUKZ
              </span>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">
                Accounting
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0D1B3E] dark:hover:text-white transition-colors duration-200 group/nav"
              >
                {link.label}
                <span className="absolute inset-x-2 -bottom-px h-0.5 bg-[#C9A84C] scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
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
