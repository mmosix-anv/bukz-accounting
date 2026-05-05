import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCourseCategories } from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { courseCategories } from '@bukz/db';
import { eq } from 'drizzle-orm';
import { Button, Paper, Stack, Title, Text, Group } from '@mantine/core';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = { title: 'Course Categories | Admin' };

async function createCategoryAction(formData: FormData) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  await db.insert(courseCategories).values({
    name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
  });

  redirect('/admin/courses/categories');
}

async function deleteCategoryAction(id: string) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db.delete(courseCategories).where(eq(courseCategories.id, id));
  redirect('/admin/courses/categories');
}

export default async function CourseCategoriesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const categories = await getCourseCategories();

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
            Course Categories
          </Title>
          <Text c="dimmed">Manage course categories</Text>
        </div>
      </Group>

      <Paper p="xl" radius="xl" className="border border-slate-200 bg-white shadow-soft">
        {/* Add Category Form */}
        <form action={createCategoryAction} className="mb-8">
          <Paper p="md" radius="lg" className="border border-slate-200 bg-slate-50">
            <Group gap="sm" align="flex-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Accounting Fundamentals"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2cd7f2] focus:outline-none"
                />
              </div>
              <div className="w-48">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  placeholder="url-slug"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2cd7f2] focus:outline-none"
                />
              </div>
              <Button type="submit" leftSection={<Plus size={14} />} className="mb-[2px]">
                Add Category
              </Button>
            </Group>
          </Paper>
        </form>

        {/* Categories List */}
        {categories.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No categories yet. Add your first category above.
          </Text>
        ) : (
          <Stack gap="md">
            {categories.map((category) => (
              <Paper
                key={category.id}
                p="md"
                radius="lg"
                className="border border-slate-200"
              >
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f2a2e] text-white text-sm font-bold">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Text fw={500}>{category.name}</Text>
                      <Text size="xs" c="dimmed">
                        /{category.slug}
                      </Text>
                    </div>
                  </Group>
                  <form action={deleteCategoryAction.bind(null, category.id)}>
                    <Button
                      type="submit"
                      variant="subtle"
                      color="red"
                      size="xs"
                      leftSection={<Trash2 size={14} />}
                      onClick={(e) => {
                        if (!confirm('Delete this category?')) {
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
}
