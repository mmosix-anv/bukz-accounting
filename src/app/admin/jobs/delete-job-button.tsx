'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteJobButton({ jobId, token }: { jobId: string; token?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm('Permanently delete this job listing?')) return;
    setPending(true);
    try {
      await fetch(`/api/v1/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
    >
      <Trash2 size={12} /> {pending ? '...' : 'Delete'}
    </button>
  );
}
