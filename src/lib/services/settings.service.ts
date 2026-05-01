import { db } from '@/lib/db';
import {
  getPlatformSettingDefault,
  parsePlatformSettingValue,
  platformSettingDefinitions,
  platformSettings,
  settingsAuditLog,
  editablePlatformSettingKeys,
  employerSubscriptionTierIds,
  jobPostingPackageIds,
  getEmployerSubscriptionSettingKey,
  getJobPostingPackageSettingKey,
  type PlatformSettingKey,
  type PlatformSettingValueMap,
  type EmployerSubscriptionTierId,
  type EmployerSubscriptionTierSetting,
  type JobPostingPackageId,
  type JobPostingPackageSetting,
  type CpdRequirements,
  type UkTaxBands,
} from '@bukz/db';
import { eq } from 'drizzle-orm';

const cache = new Map<string, { value: unknown; expiresAt: number }>();
const TTL = 60_000;

async function seedDefaults() {
  const now = new Date();
  await db
    .insert(platformSettings)
    .values(editablePlatformSettingKeys.map((key) => ({
      key,
      value: getPlatformSettingDefault(key),
      description: platformSettingDefinitions[key].description,
      updatedAt: now,
    })))
    .onConflictDoNothing();
}

export async function getSetting<K extends PlatformSettingKey>(key: K): Promise<PlatformSettingValueMap[K]> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as PlatformSettingValueMap[K];

  await seedDefaults();

  const [row] = await db.select({ value: platformSettings.value }).from(platformSettings).where(eq(platformSettings.key, key)).limit(1);
  const value = row ? parsePlatformSettingValue(key, row.value) : getPlatformSettingDefault(key);
  cache.set(key, { value, expiresAt: Date.now() + TTL });
  return value;
}

export const getCpdRequirements = () => getSetting('cpd.requirements') as Promise<CpdRequirements>;
export const getUkTaxBands = () => getSetting('tax.uk.bands') as Promise<UkTaxBands>;
export const getEmployerSubscriptionTier = (id: EmployerSubscriptionTierId) =>
  getSetting(getEmployerSubscriptionSettingKey(id)) as Promise<EmployerSubscriptionTierSetting>;
export const getJobPostingPackage = (id: JobPostingPackageId) =>
  getSetting(getJobPostingPackageSettingKey(id)) as Promise<JobPostingPackageSetting>;

export async function getPublicPricingSettings() {
  const [tiers, pkgs] = await Promise.all([
    Promise.all(employerSubscriptionTierIds.filter((id) => id !== 'free').map(getEmployerSubscriptionTier)),
    Promise.all(jobPostingPackageIds.map(getJobPostingPackage)),
  ]);
  return { employerSubscriptionTiers: tiers, jobPostingPackages: pkgs };
}

export async function getAllSettings() {
  await seedDefaults();
  return db.select().from(platformSettings);
}

export async function updateSetting<K extends PlatformSettingKey>(key: K, rawValue: unknown, userId: string, reason?: string): Promise<PlatformSettingValueMap[K]> {
  const value = parsePlatformSettingValue(key, rawValue);

  const [existing] = await db.select({ value: platformSettings.value }).from(platformSettings).where(eq(platformSettings.key, key)).limit(1);

  await db.insert(platformSettings).values({
    key, value,
    description: platformSettingDefinitions[key].description,
    updatedBy: userId, updatedAt: new Date(),
  }).onConflictDoUpdate({ target: platformSettings.key, set: { value, updatedBy: userId, updatedAt: new Date() } });

  await db.insert(settingsAuditLog).values({
    settingKey: key, oldValue: existing?.value ?? null, newValue: value, changedBy: userId, reason: reason ?? null,
  });

  cache.delete(key);
  return value;
}
