import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { getAllSettings, updateSetting } from '@/lib/services/settings.service';
import type { PlatformSettingKey } from '@bukz/db';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  return ok(await getAllSettings());
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try {
    const { key, value, reason } = await req.json() as { key: PlatformSettingKey; value: unknown; reason?: string };
    return ok(await updateSetting(key, value, user.id, reason));
  } catch (e) { return err((e as Error).message); }
}
