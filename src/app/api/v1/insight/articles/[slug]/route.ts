import { type NextRequest } from 'next/server';
import { getAuthUser, ok, err, notFound } from '@/lib/route-handler';
import { findArticleBySlug, updateArticle, publishArticle } from '@/lib/services/articles.service';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try { return ok(await findArticleBySlug(params.slug)); }
  catch { return notFound('Article'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getAuthUser(req);
  if (!user) return err('Unauthorized', 401);
  try {
    const body = await req.json() as Record<string, unknown>;
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    if (body['publish'] === true) return ok(await publishArticle(params.slug, user.id, isAdmin));
    return ok(await updateArticle(params.slug, body, user.id, isAdmin));
  } catch (e) { return err((e as Error).message); }
}
