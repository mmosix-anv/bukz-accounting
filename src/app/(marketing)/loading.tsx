import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function MarketingLoadingPage() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="border-b border-slate-100 dark:border-[#2a2d3e]">
        <Container size="xl">
          <Group h={68} justify="space-between">
            <Group gap="lg">
              <Skeleton height={32} width={32} radius="md" />
              <Skeleton height={20} width={120} radius="sm" />
            </Group>
            <Skeleton height={36} width={100} radius="md" />
          </Group>
        </Container>
      </div>

      {/* Hero skeleton */}
      <div className="bg-[#0D1B3E] dark:bg-[#0a0c14]" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <Container size="xl" py={80} w="100%">
          <Stack align="center" gap="lg">
            <Skeleton height={32} width={180} radius="xl" />
            <Skeleton height={64} width="85%" maw={700} radius="md" />
            <Skeleton height={24} width="60%" maw={500} radius="sm" />
            <Skeleton height={60} width="100%" maw={700} radius="xl" mt="lg" />
            <Group gap="sm" mt="xs">
              <Skeleton height={14} width={40} radius="sm" />
              <Skeleton height={26} width={140} radius="xl" />
              <Skeleton height={26} width={100} radius="xl" />
              <Skeleton height={26} width={120} radius="xl" />
              <Skeleton height={26} width={100} radius="xl" />
            </Group>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
