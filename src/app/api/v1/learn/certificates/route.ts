import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized } from '@/lib/route-handler';
import { findCertificatesByUser } from '@/lib/services/certificates.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return ok(await findCertificatesByUser(user.id));
}
