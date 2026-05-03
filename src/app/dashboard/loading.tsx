import { Container, Skeleton, Group, Stack, SimpleGrid } from '@mantine/core';

export default function DashboardLoadingPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Welcome heading skeleton */}
        <Stack gap={6}>
          <Skeleton height={32} width={280} radius="sm" />
          <Skeleton height={16} width={220} radius="sm" />
        </Stack>

        {/* Stat cards skeleton */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-5">
              <Skeleton height={36} width={50} radius="sm" mb="xs" />
              <Skeleton height={14} width={100} radius="sm" />
            </div>
          ))}
        </SimpleGrid>

        {/* Two-column cards skeleton */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {/* Applications card */}
          <div className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-6">
            <Group justify="space-between" mb="lg">
              <Skeleton height={18} width={160} radius="sm" />
              <Skeleton height={14} width={100} radius="sm" />
            </Group>
            <Stack gap="md">
              {Array.from({ length: 4 }).map((_, i) => (
                <Group key={i} justify="space-between" align="flex-start">
                  <Stack gap={4} flex={1}>
                    <Skeleton height={14} width="70%" radius="sm" />
                    <Skeleton height={12} width={140} radius="sm" />
                  </Stack>
                  <Skeleton height={22} width={70} radius="xl" />
                </Group>
              ))}
            </Stack>
          </div>

          {/* Courses card */}
          <div className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-6">
            <Group justify="space-between" mb="lg">
              <Skeleton height={18} width={160} radius="sm" />
              <Skeleton height={14} width={80} radius="sm" />
            </Group>
            <Stack gap="lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <Stack key={i} gap={8}>
                  <Skeleton height={14} width="65%" radius="sm" />
                  <Group gap="sm" wrap="nowrap">
                    <Skeleton height={8} flex={1} radius="xl" />
                    <Skeleton height={12} width={30} radius="sm" />
                  </Group>
                </Stack>
              ))}
            </Stack>
          </div>
        </SimpleGrid>

        {/* Skills gap card skeleton */}
        <div className="rounded-xl border border-slate-200 dark:border-[#183038] bg-white dark:bg-[#1e2030] p-6">
          <Group justify="space-between" align="center">
            <Stack gap={6} flex={1}>
              <Skeleton height={20} width={200} radius="sm" />
              <Skeleton height={14} width="80%" maw={400} radius="sm" />
            </Stack>
            <Skeleton height={36} width={120} radius="md" />
          </Group>
        </div>
      </Stack>
    </Container>
  );
}
