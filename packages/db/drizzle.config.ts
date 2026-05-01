import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

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

// Load from root of the monorepo (two levels up from packages/db)
const root = resolve(__dirname, '..', '..');
loadEnv(resolve(root, '.env.local'), resolve(root, '.env'));

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL']!,
  },
} satisfies Config;
