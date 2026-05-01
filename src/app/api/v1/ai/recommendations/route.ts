import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized } from '@/lib/route-handler';
import { getJobRecommendations, getCourseRecommendations } from '@/lib/services/ai.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const type = new URL(req.url).searchParams.get('type');
  const limit = Number(new URL(req.url).searchParams.get('limit') ?? 6);

  if (type === 'courses') return ok(await getCourseRecommendations(user.id, limit));
  return ok(await getJobRecommendations(user.id, limit));
}
