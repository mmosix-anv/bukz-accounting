'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/progress-bar';
import { Button, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';

const QUALIFICATIONS = ['ACA', 'ACCA', 'CIMA', 'AAT', 'CTA', 'ATT', 'ICAEW', 'CIPFA'];
const SOFTWARE_SKILLS = ['Xero', 'Sage', 'QuickBooks', 'IRIS', 'CCH', 'FreeAgent', 'Excel Advanced', 'Power BI'];
const STEPS = ['About you', 'Qualifications', 'Skills'];

const step1Schema = z.object({
  location: z.string().min(2, 'Enter your city or region'),
  headline: z.string().min(5, 'Add a short professional headline'),
  yearsExperience: z.coerce.number().min(0).max(50),
});

const step2Schema = z.object({
  qualifications: z.array(z.string()).min(1, 'Select at least one qualification'),
});

const step3Schema = z.object({
  softwareSkills: z.array(z.string()).min(1, 'Select at least one software skill'),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

export function CandidateOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [step2Data, setStep2Data] = useState<Step2 | null>(null);
  const [selectedQuals, setSelectedQuals] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) });

  function toggleQual(q: string) {
    const next = selectedQuals.includes(q)
      ? selectedQuals.filter((x) => x !== q)
      : [...selectedQuals, q];
    setSelectedQuals(next);
    form2.setValue('qualifications', next, { shouldValidate: true });
  }

  function toggleSkill(s: string) {
    const next = selectedSkills.includes(s)
      ? selectedSkills.filter((x) => x !== s)
      : [...selectedSkills, s];
    setSelectedSkills(next);
    form3.setValue('softwareSkills', next, { shouldValidate: true });
  }

  async function onStep1(data: Step1) {
    setStep1Data(data);
    setStep(2);
  }

  async function onStep2(data: Step2) {
    setStep2Data(data);
    setStep(3);
  }

  async function onStep3(_data: Step3) {
    setSaving(true);
    try {
      router.push('/jobs');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <OnboardingProgress current={step} total={3} steps={STEPS} />

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)}>
          <Stack gap="md">
            <TextInput
              label="City or region"
              placeholder="London, Manchester, Remote"
              error={form1.formState.errors.location?.message}
              {...form1.register('location')}
            />
            <TextInput
              label="Professional headline"
              placeholder="e.g. ACCA-qualified Management Accountant"
              error={form1.formState.errors.headline?.message}
              {...form1.register('headline')}
            />
            <TextInput
              label="Years of experience"
              type="number"
              min={0}
              max={50}
              maw={140}
              error={form1.formState.errors.yearsExperience?.message}
              {...form1.register('yearsExperience')}
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
              Select your accounting qualifications
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
            <Button type="submit">Continue</Button>
          </Group>
          </Stack>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={form3.handleSubmit(onStep3)}>
          <Stack gap="md">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Select your accounting software skills
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {SOFTWARE_SKILLS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  variant={selectedSkills.includes(s) ? 'filled' : 'default'}
                >
                  {s}
                </Button>
              ))}
            </SimpleGrid>
            {form3.formState.errors.softwareSkills && (
              <Text size="xs" c="red">
                {form3.formState.errors.softwareSkills.message}
              </Text>
            )}
            <input type="hidden" {...form3.register('softwareSkills')} />
          </Stack>
          <Group grow>
            <Button
              type="button"
              onClick={() => setStep(2)}
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
