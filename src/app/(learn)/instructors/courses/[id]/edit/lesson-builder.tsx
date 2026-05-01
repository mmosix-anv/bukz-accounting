'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { apiFetch } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  isFree: boolean;
  position: number;
}

interface Section {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

interface Props {
  course: Course;
  token: string | undefined;
}

function SortableLesson({
  lesson,
  onEdit,
  onToggleFree,
}: {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onToggleFree: (lesson: Lesson) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 ${isDragging ? 'shadow-lg border-primary/50 z-50' : 'border-slate-200'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 hover:text-slate-500 touch-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {lesson.durationMinutes && (
            <span className="text-xs text-slate-400">{lesson.durationMinutes}m</span>
          )}
          {lesson.isFree && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700 font-medium">
              Free
            </span>
          )}
          {lesson.videoUrl && <span className="text-xs text-slate-400">📹 Video</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleFree(lesson)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            lesson.isFree ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-green-50'
          }`}
        >
          {lesson.isFree ? 'Free ✓' : 'Set free'}
        </button>
        <button
          onClick={() => onEdit(lesson)}
          className="rounded px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function LessonEditor({
  lesson,
  sectionId,
  token,
  onSave,
  onClose,
}: {
  lesson: Lesson | null;
  sectionId: string;
  token: string | undefined;
  onSave: (updated: Lesson) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? '');
  const [duration, setDuration] = useState(String(lesson?.durationMinutes ?? ''));
  const [isFree, setIsFree] = useState(lesson?.isFree ?? false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: lesson?.content ?? '',
  });

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title,
        content: editor?.getText() ?? '',
        videoUrl: videoUrl || null,
        durationMinutes: duration ? Number(duration) : null,
        isFree,
      };

      let saved: Lesson;
      if (lesson) {
        saved = await apiFetch<Lesson>(`/learn/courses/lessons/${lesson.id}`, {
          method: 'PATCH', token, body: JSON.stringify(body),
        });
      } else {
        saved = await apiFetch<Lesson>(`/learn/courses/sections/${sectionId}/lessons`, {
          method: 'POST', token, body: JSON.stringify(body),
        });
      }
      onSave(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-primary">{lesson ? 'Edit lesson' : 'Add lesson'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lesson title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to IFRS 16"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lesson content</label>
            <div className="rounded-md border border-slate-300 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 flex gap-1 px-2 py-1.5">
                {editor && [
                  { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                  { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                  { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={btn.action}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${btn.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none min-h-[140px] px-4 py-3 [&_.ProseMirror]:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Video URL (optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://vimeo.com/..."
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15"
                className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm font-medium text-slate-700">Free preview lesson</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : lesson ? 'Save changes' : 'Add lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LessonBuilder({ course, token }: Props) {
  const [sections, setSections] = useState<Section[]>(course.sections);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson | null; sectionId: string } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent, sectionId: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const oldIndex = section.lessons.findIndex((l) => l.id === active.id);
    const newIndex = section.lessons.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...section.lessons];
    const [moved] = reordered.splice(oldIndex, 1);
    if (moved) reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((l) => l.id);
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, lessons: reordered } : s)),
    );

    await apiFetch(`/learn/courses/sections/${sectionId}/reorder`, {
      method: 'POST', token, body: JSON.stringify({ orderedIds }),
    });
  }

  async function addSection() {
    if (!newSectionTitle.trim()) return;
    const section = await apiFetch<Section>(`/learn/courses/${course.id}/sections`, {
      method: 'POST', token, body: JSON.stringify({ title: newSectionTitle }),
    });
    setSections((prev) => [...prev, { ...section, lessons: [] }]);
    setNewSectionTitle('');
    setAddingSection(false);
  }

  function handleLessonSaved(sectionId: string, saved: Lesson) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const existing = s.lessons.find((l) => l.id === saved.id);
        if (existing) {
          return { ...s, lessons: s.lessons.map((l) => (l.id === saved.id ? saved : l)) };
        }
        return { ...s, lessons: [...s.lessons, saved] };
      }),
    );
    setEditingLesson(null);
  }

  async function toggleLessonFree(sectionId: string, lesson: Lesson) {
    const updated = await apiFetch<Lesson>(`/learn/courses/lessons/${lesson.id}`, {
      method: 'PATCH', token, body: JSON.stringify({ isFree: !lesson.isFree }),
    });
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : { ...s, lessons: s.lessons.map((l) => (l.id === lesson.id ? updated : l)) },
      ),
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between bg-slate-50 px-5 py-3.5 border-b border-slate-200">
            <h3 className="font-semibold text-primary">{section.title}</h3>
            <span className="text-xs text-slate-400">{section.lessons.length} lessons</span>
          </div>

          <div className="p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, section.id)}
            >
              <SortableContext
                items={section.lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {section.lessons.map((lesson) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={(l) => setEditingLesson({ lesson: l, sectionId: section.id })}
                      onToggleFree={(l) => toggleLessonFree(section.id, l)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={() => setEditingLesson({ lesson: null, sectionId: section.id })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors"
            >
              + Add lesson
            </button>
          </div>
        </div>
      ))}

      {addingSection ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-primary mb-3">New section</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title, e.g. Module 1: Introduction"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
              autoFocus
            />
            <button onClick={addSection} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              Add
            </button>
            <button onClick={() => setAddingSection(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-5 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-colors"
        >
          + Add section
        </button>
      )}

      {editingLesson && (
        <LessonEditor
          lesson={editingLesson.lesson}
          sectionId={editingLesson.sectionId}
          token={token}
          onSave={(saved) => handleLessonSaved(editingLesson.sectionId, saved)}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}
