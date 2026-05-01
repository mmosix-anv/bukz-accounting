'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClient } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  coverLetter: z.string().max(2000, 'Cover letter must be under 2,000 characters').optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  jobId: string;
  jobTitle: string;
}

export function ApplyModal({ jobId, jobTitle }: Props) {
  const [open, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setServerError('Please log in again'); return; }

    try {
      await apiFetch('/jobs/applications', {
        method: 'POST',
        token,
        body: JSON.stringify({ jobId, coverLetter: values.coverLetter }),
      });
      setSuccess(true);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  if (success) {
    return (
      <Alert color="green" variant="light">
        <Text fw={600}>Application submitted!</Text>
        <Text size="xs" c="dimmed" mt={4}>
          The employer will be in touch if you&apos;re shortlisted.
        </Text>
      </Alert>
    );
  }

  return (
    <>
      <Button onClick={openModal} fullWidth color="primary">
        Apply now
      </Button>

      <Modal opened={open} onClose={closeModal} title={`Apply for ${jobTitle}`} centered>
        <Stack gap="md">
          {serverError && (
            <Alert color="red" variant="light">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="sm">
              <Textarea
                label="Cover letter (optional)"
                placeholder="Why are you a great fit for this role?"
                minRows={5}
                autosize
                disabled={isSubmitting}
                error={errors.coverLetter?.message}
                {...register('coverLetter')}
              />

              <Text size="xs" c="dimmed">
                Your CV and profile will be sent to the employer.
              </Text>

              <Group justify="flex-end">
                <Button variant="default" type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting} color="primary">
                  Submit application
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Modal>
    </>
  );
}
