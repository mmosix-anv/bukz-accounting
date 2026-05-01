'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from '@mantine/core';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(160, 'Max 160 characters'),
  description: z.string().min(50, 'Full description must be at least 50 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  priceGbp: z.coerce.number().min(0, 'Price must be 0 or more'),
  cpdHours: z.coerce.number().min(0.5, 'CPD hours must be at least 0.5'),
});

type FormValues = z.infer<typeof schema>;

export function NewCourseForm({ token }: { token?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { level: 'intermediate', priceGbp: 97, cpdHours: 3 },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/learn/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(values),
    });
    if (!res.ok) { setError('Failed to create course. Please try again.'); return; }
    const course = await res.json() as { id: string };
    router.push(`/instructors/courses/${course.id}/edit`);
  }

  return (
    <Card component="form" onSubmit={handleSubmit(onSubmit)} withBorder radius="md" p="lg">
      <Stack gap="md">
        {error && <Alert color="red" variant="light">{error}</Alert>}

        <TextInput
          label="Course title"
          placeholder="e.g. Making Tax Digital for Accountants"
          error={errors.title?.message}
          {...register('title')}
        />

        <TextInput
          label="Short description"
          description="Shown in search results, max 160 characters"
          placeholder="A concise overview of what students will learn"
          error={errors.shortDescription?.message}
          {...register('shortDescription')}
        />

        <Textarea
          label="Full description"
          minRows={5}
          placeholder="Detailed overview, prerequisites, learning outcomes"
          error={errors.description?.message}
          {...register('description')}
        />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Controller
            control={control}
            name="level"
            render={({ field }) => (
              <Select
                label="Level"
                data={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          <Controller
            control={control}
            name="priceGbp"
            render={({ field }) => (
              <NumberInput
                label="Price (GBP)"
                min={0}
                decimalScale={2}
                fixedDecimalScale
                value={field.value}
                onChange={(value) => field.onChange(value)}
                error={errors.priceGbp?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="cpdHours"
            render={({ field }) => (
              <NumberInput
                label="CPD hours"
                min={0.5}
                step={0.5}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                error={errors.cpdHours?.message}
              />
            )}
          />
        </SimpleGrid>

        <Button type="submit" loading={isSubmitting} fullWidth>
          Create course & add lessons
        </Button>
      </Stack>
    </Card>
  );
}
