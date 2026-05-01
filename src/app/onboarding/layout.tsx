import Link from 'next/link';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-primary">BUKZ</Link>
          <span className="text-sm text-slate-500">Setting up your account</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
