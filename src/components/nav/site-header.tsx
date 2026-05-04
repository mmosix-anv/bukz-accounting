import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { AuthedHeader } from './authed-header';
import { GuestHeader } from './guest-header';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-full.svg"
              alt="BUKZ Accounting — Chartered Accountants"
              width={200}
              height={41}
              className="hidden md:block"
              priority
            />
            <Image
              src="/images/logo-full.svg"
              alt="BUKZ Accounting — Chartered Accountants"
              width={155}
              height={32}
              className="block md:hidden"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0f2a2e]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? <AuthedHeader user={user} /> : <GuestHeader />}
        </div>
      </div>
    </header>
  );
}
