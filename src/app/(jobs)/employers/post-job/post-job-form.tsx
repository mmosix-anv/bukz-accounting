'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/progress-bar';
import { Step1Details } from './step1-details';
import { Step2Description } from './step2-description';
import { Step3Requirements } from './step3-requirements';
import { Step4Package } from './step4-package';
import { Step5Preview } from './step5-preview';
import type { JobPostingPackageSetting } from '@bukz/db';

const STEPS = ['Details', 'Description', 'Requirements', 'Package', 'Preview'];

const formSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  categoryId: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'interim', 'graduate']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'director', 'cfo']),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  qualifications: z.array(z.string()),
  softwareSkills: z.array(z.string()),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  location: z.string().min(2, 'Enter a location'),
  remotePolicy: z.enum(['office', 'hybrid', 'remote']),
  packageType: z.enum(['single', 'triple']).default('single'),
});

export type PostJobFormValues = z.infer<typeof formSchema>;

interface Props {
  packages: JobPostingPackageSetting[];
}

export function PostJobForm({ packages }: Props) {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const methods = useForm<PostJobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: 'full_time',
      experienceLevel: 'mid',
      remotePolicy: 'hybrid',
      qualifications: [],
      softwareSkills: [],
      packageType: 'single',
      description: '',
    },
    mode: 'onChange',
  });

  async function onFinalSubmit(values: PostJobFormValues) {
    router.push('/employers/dashboard?posted=true');
    void values;
  }

  return (
    <FormProvider {...methods}>
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <OnboardingProgress current={step} total={5} steps={STEPS} />

        {step === 1 && <Step1Details onNext={() => setStep(2)} />}
        {step === 2 && <Step2Description onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3Requirements onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4Package packages={packages} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
        {step === 5 && (
          <Step5Preview
            onBack={() => setStep(4)}
            onSubmit={methods.handleSubmit(onFinalSubmit)}
            isSubmitting={methods.formState.isSubmitting}
          />
        )}
      </div>
    </FormProvider>
  );
}
