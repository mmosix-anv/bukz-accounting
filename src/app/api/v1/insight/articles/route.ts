import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { findAllArticles, createArticle } from '@/lib/services/articles.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return ok(await findAllArticles(
    Number(searchParams.get('limit') ?? 20),
    Number(searchParams.get('offset') ?? 0),
    searchParams.get('categoryId') ?? undefined,
    searchParams.get('search') ?? undefined,
  ));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try {
    const body = await req.json() as Parameters<typeof createArticle>[0];
    return ok(await createArticle({ ...body, authorId: user.id }), 201);
  } catch (e) { return err((e as Error).message); }
}
