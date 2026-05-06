import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

type DependencyStatus = 'ok' | 'missing_config' | 'error';

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks: {
    database: DependencyStatus;
    stripe: DependencyStatus;
    search: DependencyStatus;
    email: DependencyStatus;
    sentry: DependencyStatus;
  };
}

function configured(...keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

export async function getHealthCheck(): Promise<HealthCheckResult> {
  let database: DependencyStatus = 'ok';

  try {
    await db.execute(sql`select 1`);
  } catch {
    database = 'error';
  }

  const checks = {
    database,
    stripe: configured('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET') ? 'ok' : 'missing_config',
    search: configured('NEXT_PUBLIC_ALGOLIA_APP_ID', 'ALGOLIA_ADMIN_KEY') ? 'ok' : 'missing_config',
    email: configured('RESEND_API_KEY', 'RESEND_FROM_EMAIL') ? 'ok' : 'missing_config',
    sentry: configured('SENTRY_DSN') || configured('NEXT_PUBLIC_SENTRY_DSN') ? 'ok' : 'missing_config',
  } satisfies HealthCheckResult['checks'];

  const status = Object.values(checks).every((value) => value === 'ok') ? 'ok' : 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };
}
