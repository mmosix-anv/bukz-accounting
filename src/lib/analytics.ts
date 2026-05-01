import { PostHog } from 'posthog-node';

declare global {
  // eslint-disable-next-line no-var
  var __posthog: PostHog | undefined;
}

function getClient(): PostHog | null {
  const key = process.env['POSTHOG_API_KEY'];
  const host = process.env['POSTHOG_HOST'];
  if (!key || !host) return null;
  if (!globalThis.__posthog) {
    globalThis.__posthog = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
  }
  return globalThis.__posthog;
}

export function capture(distinctId: string, event: string, properties?: Record<string, unknown>) {
  getClient()?.capture({ distinctId, event, properties });
}
