import { type NextRequest } from 'next/server';
import { ok, err } from '@/lib/route-handler';
import { getSalaryBenchmark } from '@/lib/services/tools.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { title?: string; location?: string; experienceLevel?: string };
    return ok(await getSalaryBenchmark(body));
  } catch (e) { return err((e as Error).message); }
}
