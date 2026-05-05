import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseForm } from '../../course-form';
import { findCourseById, getCourseCategories, updateCourse } from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { users } from '@bukz/db';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = { title: 'Edit Course | Admin' };

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  try {
    const [course, categories, instructors] = await Promise.all([
      findCourseById(id),
      getCourseCategories(),
      db.select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.role, 'instructor')),
    ]);

    async function handleSubmit(formData: unknown) {
      'use server';
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.['role'] !== 'admin') {
        return { error: 'Unauthorized' };
      }

      const data = formData as {
        title: string;
        slug: string;
        description: string;
        shortDescription: string;
        priceGbp: string;
        status: 'draft' | 'published';
        categoryId: string;
        instructorId: string;
        level: 'beginner' | 'intermediate' | 'advanced';
        cpdHours: string;
      };

      try {
        await updateCourse(id, user.id, {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          priceGbp: data.priceGbp,
          status: data.status,
          categoryId: data.categoryId,
          instructorId: data.instructorId,
          level: data.level,
          cpdHours: data.cpdHours,
        }, true);
        return {};
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'Failed to update course' };
      }
    }

    const initialData = {
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      priceGbp: course.priceGbp,
      status: course.status as 'draft' | 'published',
      categoryId: course.categoryId || '',
      instructorId: course.instructorId,
      level: course.level as 'beginner' | 'intermediate' | 'advanced',
      cpdHours: course.cpdHours,
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0f2a2e]">Edit Course</h1>
          <p className="text-slate-500">Update course details</p>
        </div>

        <CourseForm
          initialData={initialData}
          categories={categories}
          instructors={instructors}
          onSubmit={handleSubmit}
          submitLabel="Update Course"
        />
      </div>
    );
  } catch (e) {
    notFound();
  }
}
