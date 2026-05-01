import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { confirmCvUpload } from '@/lib/services/candidates.service';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const { key, filename } = await req.json() as { key: string; filename: string };
    return ok(await confirmCvUpload(user.id, key, filename));
  } catch (e) { return err((e as Error).message); }
}
