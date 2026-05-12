'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Group, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from '@mantine/core';

interface ArticleData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  status?: string;
}

const CATEGORIES = ['Tax & HMRC', 'VAT', 'Payroll', 'MTD', 'Career Advice', 'Software', 'Regulation'];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ArticleForm({ token, article }: { token?: string; article?: ArticleData }) {
  const router = useRouter();
  const isEdit = !!article?.id;
  const [form, setForm] = useState({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    categoryId: article?.categoryId ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !isEdit) next.slug = slugify(String(value));
      return next;
    });
  }

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  async function save(publish = false) {
    if (publish) setPublishing(true);
    else setSaving(true);
    setError(null);

    const url = isEdit
      ? `${apiUrl}/api/v1/insight/articles/${article!.id}`
      : `${apiUrl}/api/v1/insight/articles`;

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError('Failed to save article.');
      setSaving(false);
      setPublishing(false);
      return;
    }

    const saved = (await res.json()) as { id: string };

    if (publish) {
      await fetch(`${apiUrl}/api/v1/insight/articles/${saved.id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
    }

    router.push('/admin/articles');
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <TextInput
          label="Title"
          value={form.title}
          onChange={(event) => update('title', event.currentTarget.value)}
          placeholder="Article title"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Slug"
            value={form.slug}
            onChange={(event) => update('slug', event.currentTarget.value)}
            placeholder="url-slug"
          />
          <Select
            label="Category"
            value={form.categoryId || null}
            onChange={(value) => update('categoryId', value ?? '')}
            placeholder="Select category"
            data={CATEGORIES}
          />
        </SimpleGrid>

        <Textarea
          label="Excerpt"
          description="Shown in listings"
          minRows={2}
          value={form.excerpt}
          onChange={(event) => update('excerpt', event.currentTarget.value)}
          placeholder="A brief summary of the article"
        />

        <Textarea
          label="Content"
          description="HTML supported"
          minRows={14}
          value={form.content}
          onChange={(event) => update('content', event.currentTarget.value)}
          placeholder="<p>Article content...</p>"
        />

        <Group gap="sm">
          <Button variant="outline" onClick={() => void save(false)} loading={saving}>
            Save draft
          </Button>
          <Button onClick={() => void save(true)} loading={publishing}>
            Save & publish
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
