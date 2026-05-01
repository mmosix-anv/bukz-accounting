function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env['VERCEL_URL']) return `https://${process.env['VERCEL_URL']}`;
  return `http://localhost:${process.env['PORT'] ?? 3000}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(rest.headers ?? {}),
  };

  const res = await fetch(`${getBaseUrl()}/api/v1${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
