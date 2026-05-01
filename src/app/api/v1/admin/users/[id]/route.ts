import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { updateUserRole } from '@/lib/services/admin.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try {
    const { role } = await req.json() as { role: string };
    return ok(await updateUserRole(params.id, role));
  } catch (e) { return err((e as Error).message); }
}
