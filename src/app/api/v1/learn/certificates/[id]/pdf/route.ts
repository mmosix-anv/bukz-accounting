import { type NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized, err } from '@/lib/route-handler';
import { generateCertificatePdf } from '@/lib/services/certificates.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const pdf = await generateCertificatePdf(params.id);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${params.id}.pdf"`,
      },
    });
  } catch (e) { return err((e as Error).message, 404); }
}
