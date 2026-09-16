'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Group, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from '@mantine/core';
import { apiFetch } from '@/lib/api';

interface ArticleData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  status?: string;
}

interface Category {
  id: string;
  name: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ArticleForm({ article, categories }: { article?: ArticleData; categories: Category[] }) {
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

  async function save(publish = false) {
    if (publish) setPublishing(true);
    else setSaving(true);
    setError(null);

    try {
      const body = { ...form, categoryId: form.categoryId || null };
      const saved = isEdit
        ? await apiFetch<{ id: string }>(`/insight/articles/${article!.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch<{ id: string }>('/insight/articles', { method: 'POST', body: JSON.stringify(body) });

      if (publish) {
        await apiFetch(`/insight/articles/${saved.id}`, { method: 'PATCH', body: JSON.stringify({ publish: true }) });
      }

      router.push('/admin/articles');
    } catch {
      setError('Failed to save article.');
      setSaving(false);
      setPublishing(false);
    }
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
            data={categories.map((c) => ({ value: c.id, label: c.name }))}
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
