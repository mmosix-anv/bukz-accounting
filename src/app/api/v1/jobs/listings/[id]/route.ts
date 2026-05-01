import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err, notFound } from '@/lib/route-handler';
import { findJobListingById, findJobListingBySlug, updateJobListing, softDeleteJobListing, incrementJobViews } from '@/lib/services/job-listings.service';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await findJobListingById(params.id).catch(() => findJobListingBySlug(params.id));
    await incrementJobViews(listing.id).catch(() => undefined);
    return ok(listing);
  } catch { return notFound('Job listing'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Record<string, unknown>;
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    return ok(await updateJobListing(params.id, user.id, body, isAdmin));
  } catch (e) { return err((e as Error).message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    return ok(await softDeleteJobListing(params.id, user.id, isAdmin));
  } catch (e) { return err((e as Error).message); }
}
