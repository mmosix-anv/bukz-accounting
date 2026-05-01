import { type NextRequest } from 'next/server';
import { ok } from '@/lib/route-handler';
import { getSalaryBenchmark } from '@/lib/services/salary.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return ok(await getSalaryBenchmark({
    role: searchParams.get('role') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    experienceLevel: searchParams.get('experienceLevel') ?? undefined,
  }));
}
