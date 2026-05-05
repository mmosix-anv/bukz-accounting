import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { findCourseById } from '@/lib/services/courses.service';
import { db } from '@/lib/db';
import { enrollments, users } from '@bukz/db';
import { eq, desc } from 'drizzle-orm';
import { Button, Paper, Stack, Title, Text, Group, Progress, Badge } from '@mantine/core';
import { ArrowLeft, Users, Clock, Trash2 } from 'lucide-react';

export const metadata: Metadata = { title: 'Course Enrollments | Admin' };

interface EnrollmentsPageProps {
  params: Promise<{ id: string }>;
}

async function deleteEnrollmentAction(courseId: string, enrollmentId: string) {
  'use server';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));
  redirect(`/admin/courses/${courseId}/enrollments`);
}

export default async function CourseEnrollmentsPage({ params }: EnrollmentsPageProps) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.['role'] !== 'admin') {
    redirect('/dashboard');
  }

  try {
    const course = await findCourseById(id);
    
    // Get enrollments with user details
    const enrollmentData = await db
      .select({
        id: enrollments.id,
        progressPercent: enrollments.progressPercent,
        completedAt: enrollments.completedAt,
        createdAt: enrollments.createdAt,
        userId: enrollments.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(enrollments)
      .innerJoin(users, eq(users.id, enrollments.userId))
      .where(eq(enrollments.courseId, id))
      .orderBy(desc(enrollments.createdAt));

    const completed = enrollmentData.filter((e) => e.completedAt).length;
    const inProgress = enrollmentData.length - completed;

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
            <Text c="dimmed">Manage enrollments and track progress</Text>
          </div>
        </Group>

        {/* Stats */}
        <Group gap="md" mb="xl">
          <Paper p="md" radius="lg" className="border border-slate-200 bg-white">
            <Group gap="sm">
              <Users size={20} className="text-[#2cd7f2]" />
              <div>
                <Text size="xs" c="dimmed">Total Enrolled</Text>
                <Text fw={700} size="xl">{enrollmentData.length}</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="lg" className="border border-slate-200 bg-white">
            <Group gap="sm">
              <Clock size={20} className="text-amber-500" />
              <div>
                <Text size="xs" c="dimmed">In Progress</Text>
                <Text fw={700} size="xl">{inProgress}</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="lg" className="border border-slate-200 bg-white">
            <Group gap="sm">
              <Users size={20} className="text-emerald-500" />
              <div>
                <Text size="xs" c="dimmed">Completed</Text>
                <Text fw={700} size="xl">{completed}</Text>
              </div>
            </Group>
          </Paper>
        </Group>

        {/* Enrollments List */}
        <Paper p="xl" radius="xl" className="border border-slate-200 bg-white shadow-soft">
          <Title order={2} size="h4" mb="lg">
            Enrolled Students
          </Title>

          {enrollmentData.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No enrollments yet. Students will appear here when they enroll.
            </Text>
          ) : (
            <Stack gap="md">
              {enrollmentData.map((enrollment) => (
                <Paper
                  key={enrollment.id}
                  p="md"
                  radius="lg"
                  className="border border-slate-200"
                >
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={500}>{enrollment.userName || 'Unknown'}</Text>
                      <Text size="xs" c="dimmed">
                        {enrollment.userEmail}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <Text size="xs" c="dimmed">
                          Enrolled {enrollment.createdAt?.toLocaleDateString?.() || 'Recently'}
                        </Text>
                        {enrollment.completedAt && (
                          <Badge size="xs" color="green" variant="light">
                            Completed
                          </Badge>
                        )}
                      </Group>
                    </div>
                    <Group gap="md">
                      <div className="w-32">
                        <Progress
                          value={enrollment.progressPercent}
                          size="sm"
                          color={enrollment.progressPercent === 100 ? 'green' : 'blue'}
                        />
                        <Text size="xs" c="dimmed" ta="center" mt={2}>
                          {enrollment.progressPercent}%
                        </Text>
                      </div>
                      <form
                        action={deleteEnrollmentAction.bind(null, id, enrollment.id)}
                      >
                        <Button
                          type="submit"
                          variant="subtle"
                          color="red"
                          size="xs"
                          leftSection={<Trash2 size={14} />}
                          onClick={(e) => {
                            if (!confirm('Remove this enrollment?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Remove
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
