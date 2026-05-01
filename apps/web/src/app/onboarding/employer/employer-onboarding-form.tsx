'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/progress-bar';
import { Button, Group, Radio, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';

const STEPS = ['Company details', 'Sector & size'];

const step1Schema = z.object({
  companyName: z.string().min(2, 'Enter your company name'),
  website: z.string().url('Enter a valid website URL').optional().or(z.literal('')),
});

const step2Schema = z.object({
  companySize: z.enum(['1-10', '11-50', '51-250', '251-1000', '1000+']),
  sector: z.string().min(2, 'Select or enter a sector'),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

const SECTORS = ['Practice', 'Industry', 'Financial Services', 'Public Sector', 'Charity', 'Property'];

export function EmployerOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { companySize: '11-50' },
  });

  async function onStep1(data: Step1) {
    void data;
    setStep(2);
  }

  async function onStep2(_data: Step2) {
    setSaving(true);
    try {
      router.push('/employers/dashboard');
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
            <TextInput
              label="Company name"
              placeholder="Acme Accountants Ltd"
              error={form1.formState.errors.companyName?.message}
              {...form1.register('companyName')}
            />
            <TextInput
              label="Company website (optional)"
              placeholder="https://example.com"
              type="url"
              error={form1.formState.errors.website?.message}
              {...form1.register('website')}
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
          <Radio.Group label="Company size (employees)" value={form2.watch('companySize')} onChange={(value) => form2.setValue('companySize', value as Step2['companySize'])}>
            <SimpleGrid cols={{ base: 3, sm: 5 }} spacing="xs" mt="xs">
              {(['1-10', '11-50', '51-250', '251-1000', '1000+'] as const).map((size) => (
                <Radio.Card
                  key={size}
                  value={size}
                  radius="md"
                  p="sm"
                >
                  <Text ta="center" size="sm" fw={600}>{size}</Text>
                </Radio.Card>
              ))}
            </SimpleGrid>
          </Radio.Group>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Industry sector
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
              {SECTORS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  onClick={() => form2.setValue('sector', s)}
                  variant={form2.watch('sector') === s ? 'filled' : 'default'}
                >
                  {s}
                </Button>
              ))}
            </SimpleGrid>
            <input type="hidden" {...form2.register('sector')} />
            {form2.formState.errors.sector && (
              <Text size="xs" c="red">{form2.formState.errors.sector.message}</Text>
            )}
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
