import { type NextRequest } from 'next/server';
import { getAuthUser, ok, unauthorized, forbidden, err } from '@/lib/route-handler';
import { updateSetting } from '@/lib/services/settings.service';
import {
  getEmployerSubscriptionSettingKey,
  getJobPostingPackageSettingKey,
  type EmployerSubscriptionTierSetting,
  type JobPostingPackageSetting,
} from '@bukz/db';

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'admin') return forbidden();

  try {
    const { employerSubscriptionTiers, jobPostingPackages } = await req.json() as {
      employerSubscriptionTiers: EmployerSubscriptionTierSetting[];
      jobPostingPackages: JobPostingPackageSetting[];
    };

    const savedTiers = await Promise.all(
      employerSubscriptionTiers.map((tier) => updateSetting(getEmployerSubscriptionSettingKey(tier.id), tier, user.id)),
    );
    const savedPackages = await Promise.all(
      jobPostingPackages.map((pkg) => updateSetting(getJobPostingPackageSettingKey(pkg.id), pkg, user.id)),
    );

    return ok({ employerSubscriptionTiers: savedTiers, jobPostingPackages: savedPackages });
  } catch (e) { return err((e as Error).message); }
}
