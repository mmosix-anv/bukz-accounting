import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, err } from '@/lib/route-handler';
import { getMe, updateProfile, updateUser } from '@/lib/services/auth.service';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  try { return ok(await getMe(user.id)); } catch (e) { return err((e as Error).message, 404); }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const body = await req.json() as Record<string, unknown>;

  const profileData: Parameters<typeof updateProfile>[1] = {};
  if ('bio' in body) profileData.bio = body['bio'] as string;
  if ('location' in body) profileData.location = body['location'] as string;
  if ('phone' in body) profileData.phone = body['phone'] as string;
  if ('linkedinUrl' in body) profileData.linkedinUrl = body['linkedinUrl'] as string;
  if ('websiteUrl' in body) profileData.websiteUrl = body['websiteUrl'] as string;

  const userData: Parameters<typeof updateUser>[1] = {};
  if ('name' in body) userData.name = body['name'] as string;
  if ('avatarUrl' in body) userData.avatarUrl = body['avatarUrl'] as string;

  if (Object.keys(userData).length) await updateUser(user.id, userData);
  if (Object.keys(profileData).length) await updateProfile(user.id, profileData);

  return ok(await getMe(user.id));
}
