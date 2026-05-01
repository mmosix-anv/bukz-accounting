'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { Heart, MapPin, Clock, ArrowRight } from 'lucide-react';

export interface JobHit {
  objectID: string;
  slug: string;
  title: string;
  location: string;
  jobType: string;
  remotePolicy: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  featured?: boolean;
  createdAt?: string;
}

function formatSalary(min?: number, max?: number, currency = 'GBP'): string {
  if (!min && !max) return 'Salary not specified';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatJobType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function JobCard({ hit }: { hit: JobHit }) {
  const [saved, setSaved] = useState(false);

  return (
    <Card
      withBorder
      radius="lg"
      padding="lg"
      className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{
        borderColor: hit.featured ? 'var(--mantine-color-accent-2)' : undefined,
        background: hit.featured ? 'var(--mantine-color-accent-0)' : undefined,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Group gap="xs">
            {hit.featured && (
              <Badge color="accent" variant="filled" size="sm" className="shadow-sm">
                Featured
              </Badge>
            )}
          </Group>
          <Text component={Link} href={`/jobs/${hit.slug}`} fw={700} c="primary" lineClamp={2} className="group-hover:text-[#C9A84C] transition-colors duration-200">
            {hit.title}
          </Text>
          <Group gap="xs">
            <MapPin size={12} className="text-slate-400" />
            <Text size="sm" c="dimmed">
              {hit.location}
            </Text>
          </Group>
        </Stack>

        <Stack gap={8} align="flex-end">
          <Text fw={700} c="accent" size="lg">
            {formatSalary(hit.salaryMin, hit.salaryMax, hit.salaryCurrency)}
          </Text>
          <ActionIcon
            variant={saved ? 'filled' : 'subtle'}
            color={saved ? 'red' : 'primary'}
            radius="xl"
            size="md"
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? 'Unsave job' : 'Save job'}
            className="transition-transform hover:scale-110"
          >
            <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          </ActionIcon>
        </Stack>
      </Group>

      <Group gap="xs" mt="md">
        <Badge variant="light" color="primary" size="sm">
          {formatJobType(hit.jobType)}
        </Badge>
        {hit.remotePolicy !== 'office' && (
          <Badge variant="light" color="green" size="sm">
            {hit.remotePolicy === 'remote' ? 'Remote' : 'Hybrid'}
          </Badge>
        )}
        <Badge variant="light" color="gray" size="sm">
          {hit.experienceLevel?.replace(/_/g, ' ')}
        </Badge>
      </Group>

      <Group justify="space-between" mt="md" className="pt-3 border-t border-slate-100">
        <Group gap="xs">
          <Clock size={12} className="text-slate-400" />
          <Text size="xs" c="dimmed">
            {timeAgo(hit.createdAt)}
          </Text>
        </Group>
        <Button
          component={Link}
          href={`/jobs/${hit.slug}`}
          size="xs"
          color="primary"
          rightSection={<ArrowRight size={12} />}
          className="hover:shadow-sm transition-shadow"
        >
          View job
        </Button>
      </Group>
    </Card>
  );
}
