'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteExpertButton({ expertId }: { expertId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this expert profile?')) return;
    setPending(true);
    try {
      await fetch(`/api/v1/admin/experts/${expertId}`, { method: 'DELETE' });
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
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      <span className="inline-flex items-center gap-1"><Trash2 size={12} /> {pending ? '...' : 'Delete'}</span>
    </button>
  );
}
