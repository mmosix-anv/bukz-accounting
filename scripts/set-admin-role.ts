import { readFileSync } from 'fs';
import { resolve } from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../packages/db/src/schema/index';

function loadEnv(...paths: string[]) {
  for (const filePath of paths) {
    try {
      const content = readFileSync(filePath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx <= 0) continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch { /* file not found, skip */ }
  }
}

loadEnv(resolve(__dirname, '..', '.env.local'), resolve(__dirname, '..', '.env'));

const EMAIL = 'admin@bukzaccounting.co.uk';

async function run() {
  const client = postgres(process.env['DATABASE_URL']!);
  const db = drizzle(client, { schema });

  const [user] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, EMAIL)).limit(1);
  if (!user) {
    console.error(`No user found with email: ${EMAIL}`);
    await client.end();
    process.exit(1);
  }

  await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, user.id));
  console.log(`✓ Set role=admin for ${EMAIL} (${user.id})`);
  await client.end();
}

void run();
