import Link from 'next/link';
import { Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { BriefcaseBusiness, GraduationCap, Newspaper, Search } from 'lucide-react';

const pillars = [
  {
    title: 'BUKZ Jobs',
    description:
      'Specialist job board for ACA, ACCA, CIMA and AAT qualified professionals. Filter by qualification, sector, salary and remote working.',
    href: '/jobs',
    cta: 'Browse jobs',
    icon: BriefcaseBusiness,
  },
  {
    title: 'BUKZ Learn',
    description:
      'CPD-accredited courses built for accounting professionals. Track your hours, earn certificates, and meet ICAEW, ACCA and CIMA requirements.',
    href: '/learn',
    cta: 'Explore courses',
    icon: GraduationCap,
  },
  {
    title: 'BUKZ Insight',
    description:
      'Expert analysis, tax tools, salary benchmarker, IR35 checker, and a directory of verified accounting specialists available for consultation.',
    href: '/insight',
    cta: 'Read insight',
    icon: Newspaper,
  },
];

const firms = ['Deloitte', 'KPMG', 'PwC', 'EY', 'Grant Thornton', 'BDO'];

export default function HomePage() {
  return (
    <main>
      <Box bg="primary.8" c="white">
        <Container size="xl" py={{ base: 56, sm: 84 }}>
          <Stack align="center" gap="xl" ta="center">
            <Stack gap="md" maw={920}>
              <Title order={1} fz={{ base: 40, sm: 64 }} lh={1.05}>
                The UK&apos;s Specialist Platform for{' '}
                <Text span c="accent.3" inherit>
                  Accounting &amp; Finance
                </Text>
              </Title>
              <Text size="lg" c="primary.0">
                Find your next role, earn CPD-accredited qualifications, and access expert insight all in one place.
              </Text>
            </Stack>

            <Card component="form" maw={760} w="100%" radius="md" p="sm" shadow="md">
              <Group gap="sm" align="stretch">
                <TextInput flex={1} placeholder="Job title, skill or keyword" aria-label="Job title, skill or keyword" />
                <TextInput flex={1} placeholder="City or postcode" aria-label="City or postcode" />
                <Button component={Link} href="/jobs" color="accent" leftSection={<Search size={16} />}>
                  Search Jobs
                </Button>
              </Group>
            </Card>

            <Text size="sm" c="primary.1">
              Thousands of accounting &amp; finance roles updated daily
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="xl" py={{ base: 48, sm: 72 }}>
        <Stack gap="xl">
          <Title order={2} ta="center" c="primary.7">
            Everything you need to advance your finance career
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} withBorder radius="md" p="xl" shadow="xs">
                  <Stack gap="md">
                    <ThemeIcon color="primary" variant="light" size={48} radius="md">
                      <Icon size={24} />
                    </ThemeIcon>
                    <Stack gap={6}>
                      <Title order={3} fz="xl" c="primary.7">
                        {pillar.title}
                      </Title>
                      <Text c="dimmed">{pillar.description}</Text>
                    </Stack>
                    <Button component={Link} href={pillar.href} variant="subtle" color="accent" px={0}>
                      {pillar.cta}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Container>

      <Box bg="gray.0" py={{ base: 44, sm: 64 }}>
        <Container size="xl">
          <Stack align="center" gap="lg">
            <Title order={2} fz="xl" c="dimmed">
              Trusted by leading accounting firms
            </Title>
            <Group justify="center" gap="xl">
              {firms.map((firm) => (
                <Badge key={firm} color="gray" variant="light" size="lg">
                  {firm}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Container>
      </Box>
    </main>
  );
}
