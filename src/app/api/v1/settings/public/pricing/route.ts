import { ok } from '@/lib/route-handler';
import { getPublicPricingSettings } from '@/lib/services/settings.service';

export async function GET() {
  return ok(await getPublicPricingSettings());
}
