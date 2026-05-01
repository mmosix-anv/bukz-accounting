import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findAllExperts, createExpert } from '@/lib/services/experts.service';

export async function GET(req: NextRequest) {
  const specialisation = new URL(req.url).searchParams.get('specialisation') ?? undefined;
  return ok(await findAllExperts(specialisation));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof createExpert>[0];
    return ok(await createExpert({ ...body, userId: user.id }), 201);
  } catch (e) { return err((e as Error).message); }
}
