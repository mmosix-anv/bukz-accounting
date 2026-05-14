import { type NextRequest } from 'next/server';
import { ok, err } from '@/lib/route-handler';
import { getSalaryBenchmark } from '@/lib/services/tools.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const input = {
      title: searchParams.get('title') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      experienceLevel: searchParams.get('experienceLevel') ?? undefined,
    };
    return ok(await getSalaryBenchmark(input));
  } catch (e) { return err((e as Error).message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { title?: string; location?: string; experienceLevel?: string };
    return ok(await getSalaryBenchmark(body));
  } catch (e) { return err((e as Error).message); }
}
