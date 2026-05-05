'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Stack,
  Group,
  Text,
  Alert,
  Paper,
  Title,
} from '@mantine/core';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(200, 'Max 200 characters').optional(),
  priceGbp: z.string().min(1, 'Price is required'),
  status: z.enum(['draft', 'published']),
  categoryId: z.string().uuid('Category is required'),
  instructorId: z.string().uuid('Instructor is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  cpdHours: z.string().min(1, 'CPD hours is required'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: CourseFormData & { id?: string };
  categories: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
  onSubmit: (data: CourseFormData) => Promise<{ error?: string }>;
  submitLabel: string;
}

export function CourseForm({
  initialData,
  categories,
  instructors,
  onSubmit,
  submitLabel,
}: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      shortDescription: '',
      priceGbp: '0',
      status: 'draft',
      categoryId: '',
      instructorId: '',
      level: 'beginner',
      cpdHours: '0',
    },
  });

  const handleFormSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSubmit(data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/admin/courses');
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    const title = watch('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
      setValue('slug', slug);
    }
  };

  return (
    <Paper p="xl" radius="xl" className="border border-slate-200 bg-white shadow-soft">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="lg">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <div>
            <Text size="sm" fw={500} mb={4}>
              Title
            </Text>
            <TextInput
              {...register('title')}
              error={errors.title?.message}
              placeholder="Course title"
              size="md"
            />
          </div>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500}>
                Slug
              </Text>
              <Button variant="subtle" size="xs" onClick={generateSlug} type="button">
                Generate from title
              </Button>
            </Group>
            <TextInput
              {...register('slug')}
              error={errors.slug?.message}
              placeholder="course-url-slug"
              size="md"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Short Description (max 200 chars)
            </Text>
            <TextInput
              {...register('shortDescription')}
              error={errors.shortDescription?.message}
              placeholder="Brief course summary"
              size="md"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Full Description
            </Text>
            <Textarea
              {...register('description')}
              error={errors.description?.message}
              placeholder="Detailed course description"
              minRows={5}
              size="md"
            />
          </div>

          <Group grow>
            <div>
              <Text size="sm" fw={500} mb={4}>
                Price (GBP)
              </Text>
              <NumberInput
                placeholder="0.00"
                min={0}
                step={0.01}
                decimalScale={2}
                prefix="£"
                size="md"
                value={parseFloat(watch('priceGbp')) || 0}
                onChange={(val) => setValue('priceGbp', String(val))}
              />
            </div>

            <div>
              <Text size="sm" fw={500} mb={4}>
                CPD Hours
              </Text>
              <NumberInput
                placeholder="0"
                min={0}
                step={0.5}
                decimalScale={1}
                size="md"
                value={parseFloat(watch('cpdHours')) || 0}
                onChange={(val) => setValue('cpdHours', String(val))}
              />
            </div>
          </Group>

          <Group grow>
            <div>
              <Text size="sm" fw={500} mb={4}>
                Status
              </Text>
              <Select
                {...register('status')}
                error={errors.status?.message}
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
                size="md"
                value={watch('status')}
                onChange={(val) => setValue('status', val as 'draft' | 'published')}
              />
            </div>

            <div>
              <Text size="sm" fw={500} mb={4}>
                Level
              </Text>
              <Select
                {...register('level')}
                error={errors.level?.message}
                data={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                size="md"
                value={watch('level')}
                onChange={(val) => setValue('level', val as 'beginner' | 'intermediate' | 'advanced')}
              />
            </div>
          </Group>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Category
            </Text>
            <Select
              {...register('categoryId')}
              error={errors.categoryId?.message}
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
              size="md"
              value={watch('categoryId')}
              onChange={(val) => setValue('categoryId', val || '')}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Instructor
            </Text>
            <Select
              {...register('instructorId')}
              error={errors.instructorId?.message}
              data={instructors.map((i) => ({ value: i.id, label: i.name }))}
              placeholder="Select instructor"
              size="md"
              value={watch('instructorId')}
              onChange={(val) => setValue('instructorId', val || '')}
            />
          </div>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="default"
              onClick={() => router.push('/admin/courses')}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              loading={isSubmitting}
            >
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
