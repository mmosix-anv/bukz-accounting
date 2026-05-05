'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this course?')) return;
    setPending(true);
    try {
      await fetch(`/api/v1/learn/courses/${courseId}`, { method: 'DELETE' });
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
