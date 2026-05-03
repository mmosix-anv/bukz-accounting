import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function JobsLoadingPage() {
  return (
    <div>
      {/* Hero banner skeleton */}
      <div className="bg-[#0f2a2e] dark:bg-[#0a0c14]">
        <Container size="xl" py={64}>
          <Stack gap="md" maw={500}>
            <Skeleton height={24} width={180} radius="xl" />
            <Skeleton height={44} width="90%" radius="md" />
            <Skeleton height={18} width="70%" radius="sm" />
            <Group gap="md" mt="xs">
              <Skeleton height={14} width={80} radius="sm" />
              <Skeleton height={14} width={100} radius="sm" />
            </Group>
          </Stack>
        </Container>
      </div>

      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Search bar skeleton */}
          <div className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-4">
            <Group gap="sm">
              <Skeleton height={44} flex={1} radius="md" />
              <Skeleton height={44} width={100} radius="md" />
            </Group>
          </div>

          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Filter sidebar skeleton */}
            <Stack w={280} visibleFrom="lg" gap="md">
              <div className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-5">
                <Stack gap="lg">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Stack key={i} gap="xs">
                      <Skeleton height={12} width={80} radius="sm" />
                      <Stack gap={6}>
                        <Skeleton height={16} width="100%" radius="sm" />
                        <Skeleton height={16} width="85%" radius="sm" />
                        <Skeleton height={16} width="70%" radius="sm" />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </div>
            </Stack>

            {/* Job cards skeleton */}
            <Stack flex={1} gap="md" style={{ minWidth: 0 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-5"
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap="xs" flex={1}>
                      <Skeleton height={12} width={60} radius="xl" />
                      <Skeleton height={20} width="80%" radius="sm" />
                      <Skeleton height={14} width={150} radius="sm" />
                    </Stack>
                    <Stack align="flex-end" gap="xs">
                      <Skeleton height={18} width={120} radius="sm" />
                      <Skeleton height={28} width={28} circle />
                    </Stack>
                  </Group>
                  <Group gap="xs" mt="md">
                    <Skeleton height={22} width={80} radius="xl" />
                    <Skeleton height={22} width={60} radius="xl" />
                    <Skeleton height={22} width={70} radius="xl" />
                  </Group>
                  <Group justify="space-between" mt="md" pt="sm" className="border-t border-slate-100 dark:border-[#183038]">
                    <Skeleton height={12} width={80} radius="sm" />
                    <Skeleton height={28} width={80} radius="md" />
                  </Group>
                </div>
              ))}
            </Stack>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
