import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { getAdminJobListings, adminCreateJobListing } from '@/lib/services/admin.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  const { searchParams } = new URL(req.url);
  return ok(await getAdminJobListings(searchParams.get('status') ?? undefined, Number(searchParams.get('limit') ?? 20), Number(searchParams.get('offset') ?? 0)));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.user_metadata?.['role'] !== 'admin') return forbidden();
  try {
    const body = await req.json();
    const listing = await adminCreateJobListing({ ...body, employerId: body.employerId ?? user.id });
    return ok(listing, 201);
  } catch (e) { return err((e as Error).message); }
}
