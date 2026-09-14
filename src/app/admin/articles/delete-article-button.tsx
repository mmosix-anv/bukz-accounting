'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this article?')) return;
    setPending(true);
    try {
      await fetch(`/api/v1/admin/articles/${articleId}`, { method: 'DELETE' });
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
      {pending ? '...' : 'Delete'}
    </button>
  );
}
