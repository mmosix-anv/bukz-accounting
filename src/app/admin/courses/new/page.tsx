import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseForm } from '../course-form';
import { getCourseCategories } from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { users } from '@bukz/db';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = { title: 'New Course | Admin' };

async function createCourseAction(data: {
  title: string; slug: string; description: string; shortDescription?: string;
  priceGbp: string; status: 'draft' | 'published'; categoryId: string;
  instructorId: string; level: 'beginner' | 'intermediate' | 'advanced'; cpdHours: string;
}) {
  'use server';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    const { createCourse } = await import('@/lib/services/courses.service');
    await createCourse(data.instructorId, { ...data, shortDescription: data.shortDescription ?? '' });
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create course' };
  }
}

export default async function NewCoursePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  const [categories, instructors] = await Promise.all([
    getCourseCategories(),
    db.select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.role, 'instructor')),
  ]);

  async function handleSubmit(data: Parameters<typeof createCourseAction>[0]) {
    'use server';
    return createCourseAction(data);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f2a2e]">Create New Course</h1>
        <p className="text-slate-500">Add a new course to the platform</p>
      </div>

      <CourseForm
        categories={categories}
        instructors={instructors}
        onSubmit={handleSubmit}
        submitLabel="Create Course"
      />
    </div>
  );
}
