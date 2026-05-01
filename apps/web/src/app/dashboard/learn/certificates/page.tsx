import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Anchor, Button, Card, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = { title: 'My Certificates | BUKZ Learn' };

interface Certificate {
  id: string;
  issuedAt: string;
  courseTitle: string;
  courseSlug: string;
  cpdHours: string;
  certificateUrl: string | null;
}

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export default async function CertificatesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/dashboard/learn/certificates');

  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const certificates = await apiFetch<Certificate[]>('/learn/certificates/my', { token }).catch(() => [] as Certificate[]);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1} fz="h2" c="primary.7">My Certificates</Title>
          <Text c="dimmed">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</Text>
        </Stack>
        <Anchor component={Link} href="/dashboard/learn" c="accent" size="sm">My Learning</Anchor>
      </Group>

      {certificates.length === 0 ? (
        <Card withBorder radius="md" py={64} ta="center">
          <Stack align="center" gap="sm">
          <ThemeIcon size={48} radius="xl" color="accent" variant="light">
            <GraduationCap size={24} />
          </ThemeIcon>
          <Text fw={600} c="primary.7">No certificates yet</Text>
          <Text size="sm" c="dimmed">Complete a course to earn your first CPD certificate.</Text>
          <Button component={Link} href="/learn" mt="xs">
            Browse courses
          </Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {certificates.map((cert) => (
            <Card key={cert.id} withBorder radius="md" p="lg">
              <Stack gap="md">
              <Group align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon size={48} radius="xl" color="accent" variant="light">
                  <GraduationCap size={24} />
                </ThemeIcon>
                <Stack gap={4}>
                  <Anchor component={Link} href={`/learn/${cert.courseSlug}`} fw={600} c="primary.7">
                    {cert.courseTitle}
                  </Anchor>
                  <Text size="sm" c="dimmed">
                    {Number(cert.cpdHours).toFixed(1)} CPD hours · Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </Stack>
              </Group>
              <Group grow>
                <Button
                  component="a"
                  href={`${API_URL}/api/v1/learn/certificates/${cert.id}/download`}
                  target="_blank" rel="noopener noreferrer"
                >
                  Download PDF
                </Button>
                <Button
                  component="a"
                  href={`${API_URL}/api/v1/learn/certificates/${cert.id}/verify`}
                  target="_blank" rel="noopener noreferrer"
                  variant="default"
                >
                  Verify
                </Button>
              </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
      </Stack>
    </Container>
  );
}
