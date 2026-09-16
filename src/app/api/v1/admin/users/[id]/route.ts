import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { updateUserRole, adminVerifyUserEmail } from '@/lib/services/admin.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'admin') return forbidden();
  try {
    const body = await req.json() as { role?: string; verifyEmail?: boolean };
    if (body.verifyEmail) return ok(await adminVerifyUserEmail(params.id));
    return ok(await updateUserRole(params.id, body.role!));
  } catch (e) { return err((e as Error).message); }
}
