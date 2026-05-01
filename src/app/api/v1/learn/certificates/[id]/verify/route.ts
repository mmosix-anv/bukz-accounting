import { type NextRequest } from 'next/server';
import { ok, err } from '@/lib/route-handler';
import { verifyCertificate } from '@/lib/services/certificates.service';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try { return ok(await verifyCertificate(params.id)); }
  catch (e) { return err((e as Error).message, 404); }
}
