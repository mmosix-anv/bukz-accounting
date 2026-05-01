import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { syncUser } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const result = await syncUser({ id: user.id, email: user.email!, user_metadata: user.user_metadata ?? {} });
    return ok(result);
  } catch (e) {
    return err((e as Error).message);
  }
}
