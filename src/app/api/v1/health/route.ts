import { NextResponse } from 'next/server';
import { getHealthCheck } from '@/lib/services/health.service';

export async function GET() {
  const health = await getHealthCheck();
  return NextResponse.json(health, { status: health.status === 'ok' ? 200 : 503 });
}
