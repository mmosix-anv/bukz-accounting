'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Anchor, Badge, Button, Card, Group, Stack, Text } from '@mantine/core';

interface SkillGap {
  skill: string;
  currentLevel: string;
  marketDemand: string;
  gapSeverity: 'low' | 'medium' | 'high';
  recommendedCourses: { title: string; slug: string }[];
}

interface SkillsGapResult {
  summary: string;
  gaps: SkillGap[];
  topRecommendation: string;
}

interface Props {
  token?: string;
}

const SEVERITY_COLOUR: Record<SkillGap['gapSeverity'], string> = {
  high: 'red',
  medium: 'yellow',
  low: 'green',
};

export function SkillsGapButton({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillsGapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (!token) {
      setError('Please log in to run the analysis.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/v1/jobs/candidates/me/skills-gap`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = (await res.json()) as SkillsGapResult;
      setResult(data);
    } catch {
      setError('Could not run analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <Stack mt="md" gap="md" w="100%">
        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <Text size="sm" fw={600} c="primary.8">
              {result.summary}
            </Text>
            {result.gaps.length > 0 && (
              <Stack gap="xs">
                {result.gaps.map((gap) => (
                  <Card key={gap.skill} withBorder radius="md" p="md" bg={`${SEVERITY_COLOUR[gap.gapSeverity]}.0`}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="sm" fw={700}>
                        {gap.skill}
                      </Text>
                      <Badge color={SEVERITY_COLOUR[gap.gapSeverity]} variant="light">
                        {gap.gapSeverity} gap
                      </Badge>
                    </Group>
                    {gap.recommendedCourses.length > 0 && (
                      <Text size="xs" c="dimmed" mt={6}>
                        Suggested:{' '}
                        {gap.recommendedCourses.map((course, index) => (
                          <span key={course.slug}>
                            {index > 0 && ', '}
                            <Anchor component={Link} href={`/learn/${course.slug}`} size="xs">
                              {course.title}
                            </Anchor>
                          </span>
                        ))}
                      </Text>
                    )}
                  </Card>
                ))}
              </Stack>
            )}
            {result.topRecommendation && (
              <Text size="xs" c="dimmed">
                Top recommendation: <Text span fw={700} c="primary.8">{result.topRecommendation}</Text>
              </Text>
            )}
          </Stack>
        </Card>
        <Button variant="subtle" size="xs" onClick={() => setResult(null)} w="fit-content">
          Run again
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xs" align="flex-start">
      <Button onClick={() => void runAnalysis()} loading={loading} color="accent">
        Run skills analysis
      </Button>
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
    </Stack>
  );
}
