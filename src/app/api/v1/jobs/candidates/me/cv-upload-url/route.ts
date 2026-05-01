import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { getCvUploadUrl } from '@/lib/services/candidates.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename') ?? 'cv.pdf';
  const contentType = searchParams.get('contentType') ?? 'application/pdf';
  try { return ok(await getCvUploadUrl(user.id, filename, contentType)); }
  catch (e) { return err((e as Error).message); }
}
