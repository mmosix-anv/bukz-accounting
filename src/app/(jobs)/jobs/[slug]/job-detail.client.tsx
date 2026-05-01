'use client';

import Link from 'next/link';
import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { ApplyModal } from './apply-modal';

export interface JobListing {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string;
  jobType: string;
  experienceLevel: string;
  remotePolicy: string;
  qualifications: string[];
  softwareSkills: string[];
  featured: boolean;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

function formatSalary(min: string | null, max: string | null, currency: string): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(n));
  if (min && max) return `${fmt(min)} – ${fmt(max)} per year`;
  if (min) return `From ${fmt(min)} per year`;
  return `Up to ${fmt(max!)} per year`;
}

function formatEnum(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function JobDetailClient(props: {
  job: JobListing;
  isCandidate: boolean;
  isAuthed: boolean;
  shareUrl: string;
}) {
  const { job, isCandidate, isAuthed, shareUrl } = props;
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Container size="md" py="xl">
      <Group align="flex-start" gap="xl" wrap="nowrap">
        <Stack flex={1} gap="lg" style={{ minWidth: 0 }}>
          <div>
            <Group gap="sm" mb={6}>
              {job.featured && (
                <Badge color="accent" variant="filled">
                  Featured
                </Badge>
              )}
              <Badge variant="light" color="primary">
                {formatEnum(job.jobType)}
              </Badge>
              <Badge variant="light" color="gray">
                {formatEnum(job.experienceLevel)}
              </Badge>
              <Badge variant="light" color={job.remotePolicy === 'office' ? 'gray' : 'green'}>
                {formatEnum(job.remotePolicy)}
              </Badge>
            </Group>

            <Title order={1} c="primary">
              {job.title}
            </Title>
            <Text fw={700} c="accent" mt={8}>
              {salary}
            </Text>
            <Text c="dimmed" mt={4}>
              {job.location}
            </Text>
          </div>

          <Card withBorder radius="lg" padding="lg">
            <Stack gap="md">
              <Title order={3} c="primary">
                About this role
              </Title>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{job.description}</Text>

              {job.qualifications.length > 0 && (
                <>
                  <Divider />
                  <Title order={4} c="primary">
                    Required qualifications
                  </Title>
                  <List spacing="xs" size="sm">
                    {job.qualifications.map((q) => (
                      <List.Item key={q}>{q}</List.Item>
                    ))}
                  </List>
                </>
              )}

              {job.softwareSkills.length > 0 && (
                <>
                  <Divider />
                  <Title order={4} c="primary">
                    Software skills
                  </Title>
                  <Group gap="xs">
                    {job.softwareSkills.map((s) => (
                      <Badge key={s} variant="light" color="gray">
                        {s}
                      </Badge>
                    ))}
                  </Group>
                </>
              )}
            </Stack>
          </Card>

          <Group c="dimmed" fz="sm">
            <Text size="sm" c="dimmed">
              {job.viewsCount} views · {job.applicationsCount} applications
            </Text>
            <Text size="sm" c="dimmed">
              · Posted {new Date(job.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
            </Text>
          </Group>

          <Group gap="sm">
            <Button
              component="a"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
            >
              Share on LinkedIn
            </Button>
            <Button
              component="a"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
            >
              Share on X
            </Button>
          </Group>
        </Stack>

        <div style={{ width: 340 }}>
          <div style={{ position: 'sticky', top: 96 }}>
            <Card withBorder radius="lg" padding="lg">
              <Stack gap="sm">
                <div>
                  <Text fw={800} c="primary" size="xl">
                    {salary}
                  </Text>
                  <Text size="xs" c="dimmed">
                    ({job.salaryCurrency})
                  </Text>
                </div>

                {isCandidate ? (
                  <ApplyModal jobId={job.id} jobTitle={job.title} />
                ) : isAuthed ? (
                  <Text size="sm" c="dimmed" ta="center">
                    Switch to a candidate account to apply
                  </Text>
                ) : (
                  <Button component={Link} href={`/auth/register?redirectTo=/jobs/${job.slug}`} color="primary" fullWidth>
                    Create account to apply
                  </Button>
                )}

                <Divider />

                <Stack gap={6}>
                  {[
                    ['Job type', formatEnum(job.jobType)],
                    ['Level', formatEnum(job.experienceLevel)],
                    ['Remote', formatEnum(job.remotePolicy)],
                  ].map(([label, value]) => (
                    <Group key={label} justify="space-between">
                      <Text size="sm" c="dimmed">
                        {label}
                      </Text>
                      <Text size="sm" fw={600} c="primary">
                        {value}
                      </Text>
                    </Group>
                  ))}
                </Stack>

                <Text size="xs" c="dimmed">
                  By applying you agree to our <Anchor href="/terms">Terms</Anchor> and <Anchor href="/privacy">Privacy Policy</Anchor>.
                </Text>
              </Stack>
            </Card>
          </div>
        </div>
      </Group>
    </Container>
  );
}

