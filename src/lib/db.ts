import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@bukz/db';

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis.__dbClient ?? postgres(process.env['DATABASE_URL']!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
globalThis.__dbClient = client;

export const db = drizzle(client, { schema });
