import Link from 'next/link';
import { Anchor, Box, Container, SimpleGrid, Stack, Text } from '@mantine/core';

const sections = [
  {
    title: 'Jobs',
    links: [
      { label: 'Browse jobs', href: '/jobs' },
      { label: 'Post a job', href: '/employers/post-job' },
      { label: 'Salary benchmarker', href: '/jobs/salary-benchmarker' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Browse courses', href: '/learn' },
      { label: 'Beginner courses', href: '/learn?level=beginner' },
      { label: 'CPD courses', href: '/learn?cpd=true' },
    ],
  },
  {
    title: 'Insight',
    links: [
      { label: 'Editorial hub', href: '/insight' },
      { label: 'Tax calculator', href: '/tools/tax-calculator' },
      { label: 'IR35 checker', href: '/tools/ir35-checker' },
      { label: 'Expert directory', href: '/experts' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <Box component="footer" bg="primary.9" c="white" bd="1px 0 0 0 solid var(--mantine-color-gray-2)">
      <Container size="xl" py="xl">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl">
          <Stack gap="xs">
            <Text size="xl" fw={800}>
              BUKZ
            </Text>
            <Text size="sm" c="gray.4">
              The UK specialist platform for accounting &amp; finance professionals.
            </Text>
          </Stack>
          {sections.map((section) => (
            <Stack key={section.title} gap="xs">
              <Text size="sm" fw={700} c="accent.4" tt="uppercase">
                {section.title}
              </Text>
              <Stack gap={6}>
                {section.links.map((link) => (
                  <Anchor key={link.href} component={Link} href={link.href} size="sm" c="gray.4">
                    {link.label}
                  </Anchor>
                ))}
              </Stack>
            </Stack>
          ))}
        </SimpleGrid>
        <Box mt="xl" pt="lg" bd="1px 0 0 0 solid var(--mantine-color-primary-7)">
          <Text ta="center" size="sm" c="gray.5">
          &copy; {new Date().getFullYear()} BUKZ Accounting. All rights reserved. Prices in GBP.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
