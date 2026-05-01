import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { users } from './auth';

export const employerSubscriptionTierIds = ['free', 'starter', 'pro', 'enterprise'] as const;
export type EmployerSubscriptionTierId = (typeof employerSubscriptionTierIds)[number];

export const jobPostingPackageIds = ['single', 'triple', 'monthly'] as const;
export type JobPostingPackageId = (typeof jobPostingPackageIds)[number];

export const employerSubscriptionTierSettingSchema = z.object({
  id: z.enum(employerSubscriptionTierIds),
  label: z.string().min(1),
  priceMonthlyPence: z.number().int().nonnegative(),
  listings: z.number().int().positive(),
  description: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  highlight: z.boolean(),
});

export type EmployerSubscriptionTierSetting = z.infer<typeof employerSubscriptionTierSettingSchema>;

export const jobPostingPackageSettingSchema = z.object({
  id: z.enum(jobPostingPackageIds),
  label: z.string().min(1),
  pricePence: z.number().int().nonnegative(),
  priceNote: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  listingCount: z.number().int().positive(),
  badge: z.string().min(1).optional(),
  recurringInterval: z.enum(['month']).optional(),
});

export type JobPostingPackageSetting = z.infer<typeof jobPostingPackageSettingSchema>;

// ---------------------------------------------------------------------------
// CPD requirements
// ---------------------------------------------------------------------------

export const cpdRequirementsSchema = z.object({
  ICAEW: z.number().int().positive(),
  ACCA: z.number().int().positive(),
  CIMA: z.number().int().positive(),
  AAT: z.number().int().positive(),
  CIPFA: z.number().int().positive(),
});
export type CpdRequirements = z.infer<typeof cpdRequirementsSchema>;

// ---------------------------------------------------------------------------
// UK tax bands
// ---------------------------------------------------------------------------

export const ukTaxBandsSchema = z.object({
  personalAllowance: z.number().int().nonnegative(),
  basicRateBandSize: z.number().int().positive(),
  higherRateBandSize: z.number().int().positive(),
  additionalRateThreshold: z.number().int().positive(),
  basicRate: z.number().nonnegative().max(1),
  higherRate: z.number().nonnegative().max(1),
  additionalRate: z.number().nonnegative().max(1),
  niPrimaryThreshold: z.number().int().nonnegative(),
  niUpperEarningsBandSize: z.number().int().positive(),
  niLowerRate: z.number().nonnegative().max(1),
  niUpperRate: z.number().nonnegative().max(1),
});
export type UkTaxBands = z.infer<typeof ukTaxBandsSchema>;

export const DEFAULT_UK_TAX_BANDS: UkTaxBands = {
  personalAllowance: 12_570,
  basicRateBandSize: 37_700,
  higherRateBandSize: 74_870,
  additionalRateThreshold: 112_570,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  niPrimaryThreshold: 12_570,
  niUpperEarningsBandSize: 37_700,
  niLowerRate: 0.08,
  niUpperRate: 0.02,
};

const employerSubscriptionDefinitions = {
  free: {
    key: 'pricing.employerSubscription.free',
    description: 'Free employer tier settings',
    value: {
      id: 'free',
      label: 'Free',
      priceMonthlyPence: 0,
      listings: 1,
      description: 'Base employer access without a paid subscription.',
      features: ['1 active job listing', 'Standard search placement', 'Applications inbox'],
      highlight: false,
    },
  },
  starter: {
    key: 'pricing.employerSubscription.starter',
    description: 'Starter employer subscription settings',
    value: {
      id: 'starter',
      label: 'Starter',
      priceMonthlyPence: 4900,
      listings: 3,
      description: 'Perfect for small firms making occasional hires.',
      features: [
        'Up to 3 active job listings',
        'Standard search placement',
        'Applications inbox',
        'Email notifications',
        '30-day listing duration',
      ],
      highlight: false,
    },
  },
  pro: {
    key: 'pricing.employerSubscription.pro',
    description: 'Pro employer subscription settings',
    value: {
      id: 'pro',
      label: 'Pro',
      priceMonthlyPence: 9900,
      listings: 10,
      description: 'For growing firms with regular recruitment needs.',
      features: [
        'Up to 10 active job listings',
        'Priority search placement',
        'Applications inbox',
        'Email notifications',
        'Featured listing badge',
        '60-day listing duration',
        'Candidate CV access',
      ],
      highlight: true,
    },
  },
  enterprise: {
    key: 'pricing.employerSubscription.enterprise',
    description: 'Enterprise employer subscription settings',
    value: {
      id: 'enterprise',
      label: 'Enterprise',
      priceMonthlyPence: 24900,
      listings: 999,
      description: 'Unlimited hiring for large firms and recruiters.',
      features: [
        'Unlimited active listings',
        'Top search placement',
        'Dedicated account manager',
        'Bulk job import (CSV)',
        'Custom branding',
        'API access',
        'SLA support',
      ],
      highlight: false,
    },
  },
} as const satisfies Record<EmployerSubscriptionTierId, {
  key: string;
  description: string;
  value: EmployerSubscriptionTierSetting;
}>;

const jobPostingPackageDefinitions = {
  single: {
    key: 'pricing.jobPosting.single',
    description: 'Single job posting package settings',
    value: {
      id: 'single',
      label: 'Single posting',
      pricePence: 19900,
      priceNote: 'GBP, one-off',
      listingCount: 1,
      features: ['1 job listing', '30-day visibility', 'Candidate matching', 'Applicant dashboard'],
    },
  },
  triple: {
    key: 'pricing.jobPosting.triple',
    description: 'Triple job posting package settings',
    value: {
      id: 'triple',
      label: '3-Job bundle',
      pricePence: 49900,
      priceNote: 'GBP, save £98',
      listingCount: 3,
      badge: 'Best value',
      features: ['3 job listings', '30-day each', 'Priority placement', 'Candidate matching', 'Applicant dashboard'],
    },
  },
  monthly: {
    key: 'pricing.jobPosting.monthly',
    description: 'Monthly job posting package settings',
    value: {
      id: 'monthly',
      label: 'Monthly posting',
      pricePence: 14900,
      priceNote: 'GBP, billed monthly',
      listingCount: 1,
      recurringInterval: 'month',
      features: ['1 rolling job listing', 'Monthly billing', 'Candidate matching', 'Applicant dashboard'],
    },
  },
} as const satisfies Record<JobPostingPackageId, {
  key: string;
  description: string;
  value: JobPostingPackageSetting;
}>;

export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings);
export const selectPlatformSettingSchema = createSelectSchema(platformSettings);

export const settingsAuditLog = pgTable(
  'settings_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    settingKey: text('setting_key').notNull(),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value').notNull(),
    changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }),
    reason: text('reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('settings_audit_log_setting_key_idx').on(table.settingKey),
    index('settings_audit_log_created_at_idx').on(table.createdAt),
  ],
);

export const platformSettingDefinitions = {
  [employerSubscriptionDefinitions.free.key]: {
    description: employerSubscriptionDefinitions.free.description,
    schema: employerSubscriptionTierSettingSchema,
    defaultValue: employerSubscriptionDefinitions.free.value,
  },
  [employerSubscriptionDefinitions.starter.key]: {
    description: employerSubscriptionDefinitions.starter.description,
    schema: employerSubscriptionTierSettingSchema,
    defaultValue: employerSubscriptionDefinitions.starter.value,
  },
  [employerSubscriptionDefinitions.pro.key]: {
    description: employerSubscriptionDefinitions.pro.description,
    schema: employerSubscriptionTierSettingSchema,
    defaultValue: employerSubscriptionDefinitions.pro.value,
  },
  [employerSubscriptionDefinitions.enterprise.key]: {
    description: employerSubscriptionDefinitions.enterprise.description,
    schema: employerSubscriptionTierSettingSchema,
    defaultValue: employerSubscriptionDefinitions.enterprise.value,
  },
  [jobPostingPackageDefinitions.single.key]: {
    description: jobPostingPackageDefinitions.single.description,
    schema: jobPostingPackageSettingSchema,
    defaultValue: jobPostingPackageDefinitions.single.value,
  },
  [jobPostingPackageDefinitions.triple.key]: {
    description: jobPostingPackageDefinitions.triple.description,
    schema: jobPostingPackageSettingSchema,
    defaultValue: jobPostingPackageDefinitions.triple.value,
  },
  [jobPostingPackageDefinitions.monthly.key]: {
    description: jobPostingPackageDefinitions.monthly.description,
    schema: jobPostingPackageSettingSchema,
    defaultValue: jobPostingPackageDefinitions.monthly.value,
  },
  'cpd.requirements': {
    description: 'Annual CPD hour requirements per professional body',
    schema: cpdRequirementsSchema,
    defaultValue: { ICAEW: 40, ACCA: 40, CIMA: 20, AAT: 30, CIPFA: 30 } satisfies CpdRequirements,
  },
  'tax.uk.bands': {
    description: 'UK income tax and National Insurance bands for tax calculator',
    schema: ukTaxBandsSchema,
    defaultValue: DEFAULT_UK_TAX_BANDS,
  },
} as const;

export type PlatformSettingKey = keyof typeof platformSettingDefinitions;

export type PlatformSettingValueMap = {
  [K in PlatformSettingKey]: z.infer<(typeof platformSettingDefinitions)[K]['schema']>;
};

export function parsePlatformSettingValue<K extends PlatformSettingKey>(
  key: K,
  value: unknown,
): PlatformSettingValueMap[K] {
  return platformSettingDefinitions[key].schema.parse(value) as PlatformSettingValueMap[K];
}

export function getPlatformSettingDefault<K extends PlatformSettingKey>(
  key: K,
): PlatformSettingValueMap[K] {
  return platformSettingDefinitions[key].defaultValue as unknown as PlatformSettingValueMap[K];
}

export function getEmployerSubscriptionSettingKey(
  tierId: EmployerSubscriptionTierId,
): PlatformSettingKey {
  return `pricing.employerSubscription.${tierId}` as PlatformSettingKey;
}

export function getJobPostingPackageSettingKey(
  packageId: JobPostingPackageId,
): PlatformSettingKey {
  return `pricing.jobPosting.${packageId}` as PlatformSettingKey;
}

export const editablePlatformSettingKeys = Object.keys(platformSettingDefinitions) as PlatformSettingKey[];