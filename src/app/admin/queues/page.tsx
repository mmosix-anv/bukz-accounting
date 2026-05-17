import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@bukz/ui';
import { Server, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin - Queues' };

export default async function AdminQueuesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const queues = [
    { name: 'email', description: 'Transactional emails via Resend', icon: Server },
    { name: 'search-sync', description: 'Algolia index updates', icon: Server },
    { name: 'ai-embedding', description: 'OpenAI embeddings generation', icon: Server },
    { name: 'notifications', description: 'In-app notification processing', icon: Server },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-primary">Job Queues</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor background job processing</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {queues.map(({ name, description, icon: Icon }) => (
          <Card key={name} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-3">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-lg font-semibold">0</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-lg font-semibold">0</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Pending</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-lg font-semibold">0</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Failed</p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Connect Redis to enable queue monitoring via Bull Board
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-primary">Bull Board Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">
          Access the Bull Board UI at <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">/admin/queues/board</code> when Redis is connected.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Configure <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">UPSTASH_REDIS_REST_URL</code> and{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">UPSTASH_REDIS_REST_TOKEN</code> environment variables to enable.
        </p>
      </Card>
    </div>
  );
}