import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { findCourseBySlug } from '@/lib/services/courses.service';
import { getCourseProgress } from '@/lib/services/progress.service';
import { findCertificatesByUser } from '@/lib/services/certificates.service';
import { Award, Download, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = { title: 'Course Complete! | BUKZ Learn' };

export default async function CourseCompletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirectTo=/learn/${slug}/complete`);

  const course = await findCourseBySlug(slug, user.id).catch(() => null);
  if (!course) notFound();

  const progress = await getCourseProgress(user.id, course.id);
  if (progress.progressPercent < 100) {
    redirect(`/learn/${slug}`);
  }

  const certs = await findCertificatesByUser(user.id);
  const cert = certs.find((c) => c.courseId === course.id);

  const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2a2e] to-[#1a3f44]">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20">
          <Award className="h-12 w-12 text-emerald-400" />
        </div>

        <h1 className="text-4xl font-bold text-white">Congratulations!</h1>
        <p className="mt-3 text-lg text-slate-300">
          You&apos;ve completed <span className="font-semibold text-white">{course.title}</span>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-bold text-[#2cd7f2]">{course.cpdHours}</p>
            <p className="mt-1 text-sm text-slate-400">CPD hours earned</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-bold text-emerald-400">100%</p>
            <p className="mt-1 text-sm text-slate-400">Course complete</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Award className="mx-auto h-8 w-8 text-amber-400" />
            <p className="mt-2 text-sm text-slate-400">Certificate issued</p>
          </div>
        </div>

        {cert && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-lg font-semibold text-white">Your Certificate</h2>
            <p className="mt-1 text-sm text-slate-400">
              Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={`${API_URL}/api/v1/learn/certificates/${cert.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0f2a2e] transition-colors hover:bg-slate-100"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
              <a
                href={`${API_URL}/api/v1/learn/certificates/${cert.id}/verify`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                Verify Certificate
              </a>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2cd7f2] px-6 py-3 text-sm font-semibold text-[#0f2a2e] transition-colors hover:bg-[#2cd7f2]/80"
          >
            <BookOpen className="h-4 w-4" />
            Browse more courses
          </Link>
          <Link
            href="/dashboard/learn"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            My Learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-500">
          Your CPD hours have been automatically logged. View your full CPD record in{' '}
          <Link href="/dashboard/learn/cpd" className="text-[#2cd7f2] hover:underline">
            My CPD Log
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
