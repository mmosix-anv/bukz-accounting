'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { PostJobFormValues } from './post-job-form';

interface Props { onNext: () => void; onBack: () => void }

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export function Step2Description({ onNext, onBack }: Props) {
  const { setValue, watch, trigger, formState: { errors } } = useFormContext<PostJobFormValues>();
  const description = watch('description');

  const editor = useEditor({
    extensions: [StarterKit],
    content: description || '',
    onUpdate: ({ editor: e }) => {
      setValue('description', e.getText(), { shouldValidate: true });
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  async function handleNext() {
    const ok = await trigger(['description']);
    if (ok) onNext();
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Job description * <span className="text-xs text-slate-400">(min. 100 characters)</span>
        </label>

        {editor && (
          <div className="rounded-t-md border border-b-0 border-slate-300 bg-slate-50 flex flex-wrap gap-1 px-2 py-1.5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
              B
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
              I
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              H2
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
              • List
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
              1. List
            </ToolbarButton>
          </div>
        )}

        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[220px] rounded-b-md border border-slate-300 px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary [&_.ProseMirror]:outline-none"
        />

        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">{description?.length ?? 0} characters</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={handleNext} className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">Continue →</button>
      </div>
    </div>
  );
}
