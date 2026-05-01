import { type NextRequest } from 'next/server';
import { ok, err } from '@/lib/route-handler';
import { calculateTax } from '@/lib/services/tools.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { annualIncome: number; pensionContribution?: number };
    return ok(await calculateTax(body));
  } catch (e) { return err((e as Error).message); }
}
