import { SetMetadata } from '@nestjs/common';

export const SUBSCRIPTION_TIER_KEY = 'subscriptionTier';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export const RequiredSubscriptionTier = (tier: SubscriptionTier) =>
  SetMetadata(SUBSCRIPTION_TIER_KEY, tier);
