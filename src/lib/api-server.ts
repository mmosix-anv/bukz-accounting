import { cookies } from 'next/headers';

function getBaseUrl() {
  if (process.env['VERCEL_URL']) return `https://${process.env['VERCEL_URL']}`;
  return `http://localhost:${process.env['PORT'] ?? 3000}`;
}

export async function apiFetchServer<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieHeader = cookies().toString();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Cookie: cookieHeader,
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${getBaseUrl()}/api/v1${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
