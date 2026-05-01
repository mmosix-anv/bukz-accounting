'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/api';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  if (data.session) {
    await apiFetch('/auth/sync', {
      method: 'POST',
      token: data.session.access_token,
    }).catch(() => null);
  } else {
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  }

  redirect(redirectTo);
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });

  if (error) return { error: error.message };

  if (data.session) {
    await apiFetch('/auth/sync', {
      method: 'POST',
      token: data.session.access_token,
    }).catch(() => null);
  }

  const onboardingMap: Record<string, string> = {
    candidate: '/onboarding/candidate',
    employer: '/onboarding/employer',
    instructor: '/onboarding/instructor',
  };

  redirect(onboardingMap[role] ?? '/dashboard');
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env['NEXT_PUBLIC_APP_URL']}/auth/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect('/dashboard');
}

export async function signInWithGoogleAction() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env['NEXT_PUBLIC_APP_URL']}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
}
