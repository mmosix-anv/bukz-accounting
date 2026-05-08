import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const sections = [
  {
    title: 'Services',
    links: [
      { label: 'Accounting', href: '/services' },
      { label: 'Advisory', href: '/services' },
      { label: 'Financial Education', href: '/learn' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Browse courses', href: '/learn' },
      { label: 'Business setup', href: '/learn' },
      { label: 'Charity compliance', href: '/learn' },
      { label: 'UK tax essentials', href: '/learn' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative bg-[#0f2a2e] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block group">
              <Image
                src="/images/logo-full.svg"
                alt="BUKZ Accounting — Chartered Accountants"
                width={220}
                height={45}
                className="brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              ICAEW regulated accounting, advisory, and financial education for UK businesses and charities.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:border-[#2cd7f2]/30 hover:bg-[#2cd7f2]/10 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:border-[#2cd7f2]/30 hover:bg-[#2cd7f2]/10 transition-all duration-200"
                aria-label="X (Twitter)"
              >
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2cd7f2] mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                      <ArrowUpRight size={10} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Bukz Accounting Services Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            Developed by{' '}
            <a
              href="https://nextoasis.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Next Oasis Group Ltd
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
