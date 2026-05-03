import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function LoadingPage() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="border-b border-slate-100 dark:border-[#183038]">
        <Container size="xl">
          <Group h={68} justify="space-between">
            <Group gap="lg">
              <Skeleton height={32} width={32} radius="md" />
              <Skeleton height={20} width={120} radius="sm" />
              <Group gap="sm" visibleFrom="md">
                <Skeleton height={14} width={40} radius="sm" />
                <Skeleton height={14} width={40} radius="sm" />
                <Skeleton height={14} width={50} radius="sm" />
                <Skeleton height={14} width={50} radius="sm" />
              </Group>
            </Group>
            <Skeleton height={36} width={100} radius="md" />
          </Group>
        </Container>
      </div>

      {/* Hero skeleton */}
      <div className="bg-[#0f2a2e] dark:bg-[#0a0c14]">
        <Container size="xl" py={80}>
          <Stack align="center" gap="lg">
            <Skeleton height={28} width={180} radius="xl" />
            <Skeleton height={56} width="80%" maw={600} radius="md" />
            <Skeleton height={24} width="60%" maw={400} radius="sm" />
            <Skeleton height={56} width="100%" maw={700} radius="lg" mt="md" />
          </Stack>
        </Container>
      </div>

      {/* Stats skeleton */}
      <Container size="lg" mt={-48}>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-6 text-center shadow-lg">
              <Stack align="center" gap="sm">
                <Skeleton height={40} width={40} circle />
                <Skeleton height={28} width={80} radius="sm" />
                <Skeleton height={14} width={100} radius="sm" />
              </Stack>
            </div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Pillars skeleton */}
      <Container size="xl" py={80}>
        <Stack align="center" gap="md" mb="xl">
          <Skeleton height={14} width={100} radius="xl" />
          <Skeleton height={36} width="60%" maw={500} radius="sm" />
          <Skeleton height={16} width="40%" maw={300} radius="sm" />
        </Stack>
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-8">
              <Group justify="space-between" mb="lg">
                <Skeleton height={64} width={64} radius="lg" />
                <Stack align="flex-end" gap={4}>
                  <Skeleton height={24} width={60} radius="sm" />
                  <Skeleton height={12} width={80} radius="sm" />
                </Stack>
              </Group>
              <Skeleton height={12} width={120} radius="sm" mb="xs" />
              <Skeleton height={20} width="70%" radius="sm" mb="sm" />
              <Skeleton height={14} width="100%" radius="sm" mb={4} />
              <Skeleton height={14} width="90%" radius="sm" mb={4} />
              <Skeleton height={14} width="60%" radius="sm" />
              <Skeleton height={14} width={100} radius="sm" mt="lg" />
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
}
