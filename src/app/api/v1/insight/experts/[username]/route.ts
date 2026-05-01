import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, notFound } from '@/lib/route-handler';
import { findExpertByUsername, updateExpert } from '@/lib/services/experts.service';

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  try { return ok(await findExpertByUsername(params.username)); }
  catch { return notFound('Expert'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { username: string } }) {
  const user = await getAuthUser(req);
  if (!user) return err('Unauthorized', 401);
  try {
    const body = await req.json() as Parameters<typeof updateExpert>[1];
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    const expert = await findExpertByUsername(params.username);
    return ok(await updateExpert(expert.id, body, user.id, isAdmin));
  } catch (e) { return err((e as Error).message); }
}
