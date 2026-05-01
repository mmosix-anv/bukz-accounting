import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function LearnLoadingPage() {
  return (
    <div>
      {/* Hero banner skeleton */}
      <div className="bg-[#0D1B3E] dark:bg-[#0a0c14]">
        <Container size="xl" py={64}>
          <Stack gap="md" maw={500}>
            <Skeleton height={24} width={200} radius="xl" />
            <Skeleton height={44} width="85%" radius="md" />
            <Skeleton height={18} width="60%" radius="sm" />
            <Group gap="md" mt="xs">
              <Skeleton height={14} width={100} radius="sm" />
              <Skeleton height={14} width={120} radius="sm" />
            </Group>
          </Stack>
        </Container>
      </div>

      <Container size="xl" py="xl">
        {/* Search and sort skeleton */}
        <Group justify="space-between" mb="lg">
          <Skeleton height={44} width={400} maw="100%" radius="md" />
          <Skeleton height={44} width={140} radius="md" visibleFrom="sm" />
        </Group>

        <Group align="flex-start" gap="xl" wrap="nowrap">
          {/* Filter sidebar skeleton */}
          <Stack w={240} visibleFrom="lg" gap="md">
            <div className="rounded-2xl border border-slate-200 dark:border-[#2a2d3e] bg-white dark:bg-[#1e2030] p-5">
              <Stack gap="lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Stack key={i} gap="xs">
                    <Skeleton height={10} width={60} radius="sm" />
                    <Stack gap={6}>
                      <Skeleton height={16} width="100%" radius="sm" />
                      <Skeleton height={16} width="80%" radius="sm" />
                      <Skeleton height={16} width="65%" radius="sm" />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </div>
          </Stack>

          {/* Course cards grid skeleton */}
          <div className="flex-1 min-w-0">
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="lg">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-[#2a2d3e] bg-white dark:bg-[#1e2030] overflow-hidden"
                >
                  {/* Thumbnail skeleton */}
                  <Skeleton height={192} radius={0} />
                  {/* Content skeleton */}
                  <Stack p="md" gap="sm">
                    <Skeleton height={16} width="85%" radius="sm" />
                    <Skeleton height={12} width={100} radius="sm" />
                    <Skeleton height={12} width="100%" radius="sm" />
                    <Skeleton height={12} width="70%" radius="sm" />
                    {/* Rating */}
                    <Group gap="xs">
                      <Skeleton height={14} width={80} radius="sm" />
                      <Skeleton height={14} width={50} radius="sm" />
                    </Group>
                    {/* Footer */}
                    <Group justify="space-between" mt="sm" pt="sm" className="border-t border-slate-100 dark:border-[#2a2d3e]">
                      <Stack gap={4}>
                        <Skeleton height={20} width={50} radius="sm" />
                        <Skeleton height={10} width={70} radius="sm" />
                      </Stack>
                      <Skeleton height={32} width={90} radius="md" />
                    </Group>
                  </Stack>
                </div>
              ))}
            </SimpleGrid>
          </div>
        </Group>
      </Container>
    </div>
  );
}
