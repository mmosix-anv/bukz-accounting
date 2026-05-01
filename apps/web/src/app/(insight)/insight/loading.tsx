import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function InsightLoadingPage() {
  return (
    <div>
      {/* Hero banner skeleton */}
      <div className="bg-[#0D1B3E] dark:bg-[#0a0c14]">
        <Container size="xl" py={64}>
          <Stack gap="md" maw={500}>
            <Skeleton height={24} width={180} radius="xl" />
            <Skeleton height={44} width="70%" radius="md" />
            <Skeleton height={18} width="55%" radius="sm" />
          </Stack>
        </Container>
      </div>

      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Featured article skeleton */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#2a2d3e] bg-white dark:bg-[#1e2030] overflow-hidden">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
              <Skeleton height={280} radius={0} />
              <Stack p="xl" gap="md" justify="center">
                <Skeleton height={20} width={80} radius="xl" />
                <Skeleton height={28} width="90%" radius="sm" />
                <Skeleton height={14} width="100%" radius="sm" />
                <Skeleton height={14} width="85%" radius="sm" />
                <Skeleton height={14} width="60%" radius="sm" />
                <Group gap="md" mt="sm">
                  <Skeleton height={12} width={100} radius="sm" />
                  <Skeleton height={12} width={80} radius="sm" />
                </Group>
              </Stack>
            </SimpleGrid>
          </div>

          {/* Category pills skeleton */}
          <Group gap="sm">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} height={34} width={80 + Math.random() * 40} radius="xl" />
            ))}
          </Group>

          {/* Article grid skeleton */}
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-[#2a2d3e] bg-white dark:bg-[#1e2030] overflow-hidden"
              >
                <Skeleton height={192} radius={0} />
                <Stack p="md" gap="sm">
                  <Skeleton height={18} width={70} radius="xl" />
                  <Skeleton height={16} width="90%" radius="sm" />
                  <Skeleton height={16} width="70%" radius="sm" />
                  <Skeleton height={12} width="100%" radius="sm" />
                  <Skeleton height={12} width="80%" radius="sm" />
                  <Group justify="space-between" mt="sm" pt="sm" className="border-t border-slate-100 dark:border-[#2a2d3e]">
                    <Skeleton height={12} width={100} radius="sm" />
                    <Skeleton height={12} width={14} circle />
                  </Group>
                </Stack>
              </div>
            ))}
          </SimpleGrid>

          {/* Tools section skeleton */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-[#2a2d3e] bg-white dark:bg-[#1e2030] p-6">
                <Group gap="md">
                  <Skeleton height={48} width={48} radius="lg" />
                  <Stack gap={6} flex={1}>
                    <Skeleton height={16} width="60%" radius="sm" />
                    <Skeleton height={12} width="80%" radius="sm" />
                  </Stack>
                </Group>
              </div>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  );
}
