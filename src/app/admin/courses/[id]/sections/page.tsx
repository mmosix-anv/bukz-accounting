import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { findCourseById, findSectionsByCourse, deleteSection } from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { courseSections } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';
import { AdminTable, AdminTr, AdminTd } from '../../../admin-table';
import { Button, Paper, Stack, Title, Text, Group } from '@mantine/core';
import { Plus, ArrowLeft, Trash2, GripVertical } from 'lucide-react';

export const metadata: Metadata = { title: 'Course Sections | Admin' };

interface SectionsPageProps {
  params: Promise<{ id: string }>;
}

async function createSectionAction(courseId: string, formData: FormData) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  
  // Get max position
  const existingSections = await db
    .select({ position: courseSections.position })
    .from(courseSections)
    .where(eq(courseSections.courseId, courseId))
    .orderBy(desc(courseSections.position))
    .limit(1);
  
  const nextPosition = (existingSections[0]?.position ?? 0) + 1;

  await db.insert(courseSections).values({
    courseId,
    title,
    position: nextPosition,
  });

  redirect(`/admin/courses/${courseId}/sections`);
}

export default async function CourseSectionsPage({ params }: SectionsPageProps) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  try {
    const [course, sections] = await Promise.all([
      findCourseById(id),
      findSectionsByCourse(id),
    ]);

    return (
      <div>
        <Group justify="space-between" mb="xl">
          <div>
            <Text c="dimmed" size="sm" mb={4}>
              <Link href="/admin/courses" className="hover:underline">
                ← Back to Courses
              </Link>
            </Text>
            <Title order={1} size="h2">
              {course.title}
            </Title>
            <Text c="dimmed">Manage course sections and lessons</Text>
          </div>
        </Group>

        <Paper p="xl" radius="xl" className="border border-slate-200 bg-white shadow-soft">
          <Group justify="space-between" mb="lg">
            <Title order={2} size="h4">
              Sections
            </Title>
            <form action={createSectionAction.bind(null, id)}>
              <Group gap="xs">
                <TextInput
                  name="title"
                  placeholder="New section title"
                  required
                  size="sm"
                />
                <Button type="submit" size="sm" leftSection={<Plus size={14} />}>
                  Add Section
                </Button>
              </Group>
            </form>
          </Group>

          {sections.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No sections yet. Add your first section above.
            </Text>
          ) : (
            <Stack gap="md">
              {sections.map((section, index) => (
                <Paper
                  key={section.id}
                  p="md"
                  radius="lg"
                  className="border border-slate-200"
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm">
                      <Text c="dimmed" fw={700} w={24}>
                        {index + 1}
                      </Text>
                      <GripVertical size={18} className="text-slate-400" />
                      <div>
                        <Text fw={500}>{section.title}</Text>
                        <Text size="xs" c="dimmed">
                          {`Position ${section.position + 1}`}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Button
                        component={Link}
                        href={`/admin/courses/${id}/sections/${section.id}/lessons`}
                        variant="light"
                        size="xs"
                      >
                        Manage Lessons
                      </Button>
                      <form
                        action={async () => {
                          'use server';
                          await deleteSection(section.id);
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
                            if (!confirm('Delete this section and all its lessons?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </form>
                    </Group>
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

// Simple text input component for the form
function TextInput({ name, placeholder, required, size }: { name: string; placeholder: string; required?: boolean; size?: string }) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      required={required}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2cd7f2] focus:outline-none"
    />
  );
}
