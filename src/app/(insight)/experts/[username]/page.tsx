import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { CalEmbed } from './cal-embed';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialisations: string[];
  qualifications: string[];
  bio: string;
  avatarUrl: string | null;
  hourlyRateGbp: string | null;
  calUsername: string | null;
  isVerified: boolean;
}

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const expert = await apiFetch<Expert>(`/insight/experts/${params.username}`).catch(() => null);
  if (!expert) return { title: 'Expert not found' };
  return {
    title: `${expert.name} — BUKZ Expert`,
    description: expert.bio?.slice(0, 155),
  };
}

export default async function ExpertProfilePage({ params }: Props) {
  const expert = await apiFetch<Expert>(`/insight/experts/${params.username}`).catch(() => null);
  if (!expert) notFound();

  const hourly = expert.hourlyRateGbp
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(expert.hourlyRateGbp))
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-100">
                {expert.avatarUrl ? (
                  <Image src={expert.avatarUrl} alt={expert.name} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400">
                    {expert.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-primary">{expert.name}</h1>
                {expert.isVerified && (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{expert.title}</p>
              {hourly && (
                <p className="mt-2 text-lg font-semibold text-accent">{hourly}/hr</p>
              )}
            </div>

            {expert.specialisations.length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Specialisations</h2>
                <div className="flex flex-wrap gap-1.5">
                  {expert.specialisations.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {expert.qualifications.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Qualifications</h2>
                <div className="flex flex-wrap gap-1.5">
                  {expert.qualifications.map((q) => (
                    <span key={q} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">{q}</span>
                  ))}
                </div>
              </div>
            )}

            {expert.calUsername && (
              <CalEmbed calUsername={expert.calUsername} expertName={expert.name} />
            )}

            <Link
              href="/experts"
              className="mt-4 block text-center text-sm text-slate-400 hover:text-primary"
            >
              ← Back to all experts
            </Link>
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-3">About {expert.name.split(' ')[0]}</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{expert.bio}</p>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
            <h2 className="font-semibold text-primary mb-1">Ready to book a consultation?</h2>
            <p className="text-sm text-slate-600 mb-4">
              Get expert advice tailored to your specific needs. Sessions are conducted via video call.
            </p>
            {expert.calUsername ? (
              <CalEmbed calUsername={expert.calUsername} expertName={expert.name} variant="cta" />
            ) : (
              <p className="text-sm text-slate-400">Online booking is not yet available for this expert.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
