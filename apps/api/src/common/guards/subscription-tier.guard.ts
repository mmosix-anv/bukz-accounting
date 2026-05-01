import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { employerSubscriptions } from '@bukz/db';
import { eq } from 'drizzle-orm';
import { SUBSCRIPTION_TIER_KEY, type SubscriptionTier } from '../decorators/subscription-tier.decorator';
import { DrizzleService } from '../services/drizzle.service';

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

interface RequestUser {
  id: string;
  user_metadata?: {
    role?: string;
  };
}

interface RequestWithUser {
  user?: RequestUser;
}

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly drizzle: DrizzleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<SubscriptionTier>(SUBSCRIPTION_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredTier) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (user?.user_metadata?.role === 'admin') return true;
    if (!user?.id) throw new ForbiddenException('Subscription required');

    const [subscription] = await this.drizzle.db
      .select()
      .from(employerSubscriptions)
      .where(eq(employerSubscriptions.userId, user.id))
      .limit(1);

    const tier = subscription?.tier ?? 'free';
    if (subscription?.status && subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }
    if (TIER_RANK[tier] < TIER_RANK[requiredTier]) {
      throw new ForbiddenException(`${requiredTier} subscription required`);
    }

    return true;
  }
}
