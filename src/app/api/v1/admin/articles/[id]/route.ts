import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { adminUpdateArticle, adminDeleteArticle } from '@/lib/services/admin.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try { return ok(await adminUpdateArticle(params.id, await req.json())); }
  catch (e) { return err((e as Error).message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try { return ok(await adminDeleteArticle(params.id)); }
  catch (e) { return err((e as Error).message, 404); }
}
