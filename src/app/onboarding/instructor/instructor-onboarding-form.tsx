'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/progress-bar';
import { Button, Group, SimpleGrid, Stack, Text, Textarea, TextInput } from '@mantine/core';

const STEPS = ['Your background', 'Qualifications'];
const QUALIFICATIONS = ['ACA', 'ACCA', 'CIMA', 'AAT', 'CTA', 'ATT', 'ICAEW', 'CIPFA', 'PhD', 'MBA'];

const step1Schema = z.object({
  bio: z.string().min(50, 'Write at least 50 characters about yourself'),
  linkedinUrl: z.string().url('Enter a valid LinkedIn URL').optional().or(z.literal('')),
});

const step2Schema = z.object({
  qualifications: z.array(z.string()).min(1, 'Select at least one qualification'),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

export function InstructorOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedQuals, setSelectedQuals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });

  function toggleQual(q: string) {
    const next = selectedQuals.includes(q)
      ? selectedQuals.filter((x) => x !== q)
      : [...selectedQuals, q];
    setSelectedQuals(next);
    form2.setValue('qualifications', next, { shouldValidate: true });
  }

  async function onStep1(_data: Step1) {
    setStep(2);
  }

  async function onStep2(_data: Step2) {
    setSaving(true);
    try {
      router.push('/learn');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <OnboardingProgress current={step} total={2} steps={STEPS} />

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)}>
          <Stack gap="md">
            <Textarea
              label="Professional bio"
              minRows={5}
              autosize
              placeholder="Describe your professional background, expertise and teaching style"
              error={form1.formState.errors.bio?.message}
              {...form1.register('bio')}
            />
            <TextInput
              label="LinkedIn profile URL (optional)"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              error={form1.formState.errors.linkedinUrl?.message}
              {...form1.register('linkedinUrl')}
            />
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </Stack>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2)}>
          <Stack gap="md">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Select your professional qualifications
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {QUALIFICATIONS.map((q) => (
                <Button
                  key={q}
                  type="button"
                  onClick={() => toggleQual(q)}
                  variant={selectedQuals.includes(q) ? 'filled' : 'default'}
                >
                  {q}
                </Button>
              ))}
            </SimpleGrid>
            {form2.formState.errors.qualifications && (
              <Text size="xs" c="red">
                {form2.formState.errors.qualifications.message}
              </Text>
            )}
            <input type="hidden" {...form2.register('qualifications')} />
          </Stack>
          <Group grow>
            <Button
              type="button"
              onClick={() => setStep(1)}
              variant="default"
            >
              Back
            </Button>
            <Button
              type="submit"
              loading={saving}
            >
              Finish setup
            </Button>
          </Group>
          </Stack>
        </form>
      )}
    </div>
  );
}
