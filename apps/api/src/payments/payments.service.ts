import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { DrizzleService } from '../common/services/drizzle.service';
import { employerSubscriptions } from '@bukz/db';
import { eq } from 'drizzle-orm';

const SUBSCRIPTION_TIERS = {
  starter: { priceMonthly: 4900, listings: 3, label: 'Starter' },
  pro: { priceMonthly: 9900, listings: 10, label: 'Pro' },
  enterprise: { priceMonthly: 24900, listings: 999, label: 'Enterprise' },
} as const;

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '');

  constructor(private readonly drizzle: DrizzleService) {}

  async getEmployerSubscription(userId: string) {
    const [sub] = await this.drizzle.db
      .select()
      .from(employerSubscriptions)
      .where(eq(employerSubscriptions.userId, userId))
      .limit(1);
    return sub ?? null;
  }

  async createEmployerSubscriptionCheckout(userId: string, tier: keyof typeof SUBSCRIPTION_TIERS) {
    const plan = SUBSCRIPTION_TIERS[tier];
    if (!plan) throw new BadRequestException('Invalid subscription tier');

    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          unit_amount: plan.priceMonthly,
          product_data: { name: `BUKZ Jobs ${plan.label} — Monthly subscription` },
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: { userId, tier, productType: 'employer_subscription' },
      success_url: `${process.env['NEXT_PUBLIC_APP_URL']}/employers/dashboard?subscribed=true`,
      cancel_url: `${process.env['NEXT_PUBLIC_APP_URL']}/employers/pricing`,
    });
  }

  async upsertEmployerSubscription(
    userId: string,
    tier: 'free' | 'starter' | 'pro' | 'enterprise',
    stripeSubscriptionId: string | null,
    currentPeriodEnd: Date | null,
  ) {
    const limits = { free: 1, starter: 3, pro: 10, enterprise: 999 };
    const existing = await this.getEmployerSubscription(userId);
    if (existing) {
      const [updated] = await this.drizzle.db
        .update(employerSubscriptions)
        .set({ tier, stripeSubscriptionId, currentPeriodEnd, updatedAt: new Date(), activeListingsLimit: limits[tier] })
        .where(eq(employerSubscriptions.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await this.drizzle.db
      .insert(employerSubscriptions)
      .values({ userId, tier, stripeSubscriptionId, currentPeriodEnd, activeListingsLimit: limits[tier] })
      .returning();
    return created;
  }

  async createJobPostingCheckout(employerId: string, packageType: 'single' | 'triple' | 'monthly') {
    const prices: Record<string, number> = {
      single: 19900,
      triple: 49900,
      monthly: 14900,
    };

    return this.stripe.checkout.sessions.create({
      mode: packageType === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: prices[packageType] ?? 19900,
            product_data: { name: `BUKZ Jobs — ${packageType} posting` },
            ...(packageType === 'monthly' ? { recurring: { interval: 'month' } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: { employerId, packageType },
      success_url: `${process.env['NEXT_PUBLIC_APP_URL']}/employers/dashboard?payment=success`,
      cancel_url: `${process.env['NEXT_PUBLIC_APP_URL']}/employers/post-job?step=4`,
    });
  }

  async createCourseCheckout(userId: string, courseId: string, priceGbp: number) {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: Math.round(priceGbp * 100),
            product_data: { name: 'BUKZ Learn — Course enrolment' },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, courseId },
      success_url: `${process.env['NEXT_PUBLIC_APP_URL']}/dashboard/learn?enrolled=${courseId}`,
      cancel_url: `${process.env['NEXT_PUBLIC_APP_URL']}/learn/${courseId}`,
    });
  }
}
