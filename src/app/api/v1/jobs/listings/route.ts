import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findAllJobListings, createJobListing } from '@/lib/services/job-listings.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = {
    status: (searchParams.get('status') as 'active' | undefined) ?? 'active',
    limit: Number(searchParams.get('limit') ?? 20),
    offset: Number(searchParams.get('offset') ?? 0),
  };
  return ok(await findAllJobListings(filter));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof createJobListing>[0];
    const listing = await createJobListing({ ...body, employerId: user.id });
    return ok(listing, 201);
  } catch (e) { return err((e as Error).message); }
}
