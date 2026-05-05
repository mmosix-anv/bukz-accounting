import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { 
  findCourseById, 
  findSectionsByCourse, 
  findLessonsBySection,
  deleteLesson 
} from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { courseLessons } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';
import { Button, Paper, Stack, Title, Text, Group, Checkbox } from '@mantine/core';
import { Plus, Trash2, GripVertical, Clock, Video } from 'lucide-react';

export const metadata: Metadata = { title: 'Section Lessons | Admin' };

interface LessonsPageProps {
  params: Promise<{ id: string; sectionId: string }>;
}

async function createLessonAction(courseId: string, sectionId: string, formData: FormData) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string) || 0;
  const isFree = formData.get('isFree') === 'on';
  
  // Get max position
  const existingLessons = await db
    .select({ position: courseLessons.position })
    .from(courseLessons)
    .where(eq(courseLessons.sectionId, sectionId))
    .orderBy(desc(courseLessons.position))
    .limit(1);
  
  const nextPosition = (existingLessons[0]?.position ?? 0) + 1;

  await db.insert(courseLessons).values({
    sectionId,
    title,
    videoUrl: videoUrl || null,
    durationMinutes,
    isFree,
    position: nextPosition,
  });

  redirect(`/admin/courses/${courseId}/sections/${sectionId}/lessons`);
}

export default async function SectionLessonsPage({ params }: LessonsPageProps) {
  const { id, sectionId } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  try {
    const [course, sections, lessons] = await Promise.all([
      findCourseById(id),
      findSectionsByCourse(id),
      findLessonsBySection(sectionId),
    ]);

    const currentSection = sections.find(s => s.id === sectionId);
    if (!currentSection) {
      notFound();
    }

    return (
      <div>
        <Group justify="space-between" mb="xl">
          <div>
            <Text c="dimmed" size="sm" mb={4}>
              <Link href={`/admin/courses/${id}/sections`} className="hover:underline">
                ← Back to Sections
              </Link>
            </Text>
            <Title order={1} size="h2">
              {currentSection.title}
            </Title>
            <Text c="dimmed">Manage lessons in this section</Text>
          </div>
        </Group>

        <Paper p="xl" radius="xl" className="border border-slate-200 bg-white shadow-soft">
          <Group justify="space-between" mb="lg">
            <Title order={2} size="h4">
              Lessons
            </Title>
          </Group>

          {/* Add Lesson Form */}
          <form action={createLessonAction.bind(null, id, sectionId)} className="mb-8">
            <Paper p="md" radius="lg" className="border border-slate-200 bg-slate-50">
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    name="title"
                    placeholder="Lesson title"
                    required
                  />
                  <TextInput
                    name="videoUrl"
                    placeholder="Video URL (optional)"
                  />
                </Group>
                <Group grow>
                  <NumberInput
                    name="durationMinutes"
                    placeholder="Duration (minutes)"
                    min={0}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isFree" className="rounded" />
                    Free preview lesson
                  </label>
                  <Button type="submit" leftSection={<Plus size={14} />}>
                    Add Lesson
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </form>

          {lessons.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No lessons yet. Add your first lesson above.
            </Text>
          ) : (
            <Stack gap="md">
              {lessons.map((lesson, index) => (
                <Paper
                  key={lesson.id}
                  p="md"
                  radius="lg"
                  className="border border-slate-200"
                >
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <Text c="dimmed" fw={700} w={24}>
                        {index + 1}
                      </Text>
                      <GripVertical size={18} className="text-slate-400" />
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>{lesson.title}</Text>
                          {lesson.isFree && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Free
                            </span>
                          )}
                        </Group>
                        <Group gap="xs" mt={4}>
                          {lesson.videoUrl && (
                            <Text size="xs" c="dimmed" className="flex items-center gap-1">
                              <Video size={12} /> Video
                            </Text>
                          )}
                          {lesson.durationMinutes > 0 && (
                            <Text size="xs" c="dimmed" className="flex items-center gap-1">
                              <Clock size={12} /> {lesson.durationMinutes} min
                            </Text>
                          )}
                        </Group>
                      </div>
                    </Group>
                    <form
                      action={async () => {
                        'use server';
                        await deleteLesson(lesson.id);
                      }}
                      className="inline"
                    >
                      <Button
                        type="submit"
                        variant="subtle"
                        color="red"
                        size="xs"
                        leftSection={<Trash2 size={14} />}
                        onClick={(e) => {
                          if (!confirm('Delete this lesson?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </form>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </div>
    );
  } catch (e) {
    notFound();
  }
}

// Simple input components
function TextInput({ name, placeholder, required }: { name: string; placeholder: string; required?: boolean }) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2cd7f2] focus:outline-none"
    />
  );
}

function NumberInput({ name, placeholder, min }: { name: string; placeholder: string; min?: number }) {
  return (
    <input
      type="number"
      name={name}
      placeholder={placeholder}
      min={min}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2cd7f2] focus:outline-none"
    />
  );
}
