import { type NextRequest } from 'next/server';
import { ok, err } from '@/lib/route-handler';
import { checkIr35 } from '@/lib/services/tools.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { answers: Record<string, boolean> };
    return ok(checkIr35(body));
  } catch (e) { return err((e as Error).message); }
}
