import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  getEmployerSubscriptionSettingKey,
  getJobPostingPackageSettingKey,
  getPlatformSettingDefault,
  parsePlatformSettingValue,
  type EmployerSubscriptionTierId,
  type EmployerSubscriptionTierSetting,
  type JobPostingPackageId,
  type JobPostingPackageSetting,
  type PlatformSettingKey,
  enrollments,
  courses,
  payments as paymentsTable,
  users,
  employerSubscriptions,
  notifications,
  platformSettings,
} from '@bukz/db';
import { db } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';

function getStripeClient() {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

async function getUserByCustomerId(customerId: string) {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
  return user ?? null;
}

async function getPlatformSetting<K extends PlatformSettingKey>(key: K) {
  const [row] = await db.select({ value: platformSettings.value }).from(platformSettings).where(eq(platformSettings.key, key)).limit(1);

  if (row === undefined) {
    return getPlatformSettingDefault(key);
  }

  try {
    return parsePlatformSettingValue(key, row.value);
  } catch {
    return getPlatformSettingDefault(key);
  }
}

async function getEmployerTierConfig(tier: EmployerSubscriptionTierId): Promise<EmployerSubscriptionTierSetting> {
  return await getPlatformSetting(getEmployerSubscriptionSettingKey(tier)) as EmployerSubscriptionTierSetting;
}

async function getJobPackageConfig(packageType: JobPostingPackageId): Promise<JobPostingPackageSetting> {
  return await getPlatformSetting(getJobPostingPackageSettingKey(packageType)) as JobPostingPackageSetting;
}

async function persistStripeCustomerId(userId: string, customerId: string) {
  await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
}

async function getExistingEmployerSubscription(userId: string) {
  const [row] = await db.select({ id: employerSubscriptions.id, tier: employerSubscriptions.tier, activeListingsLimit: employerSubscriptions.activeListingsLimit })
    .from(employerSubscriptions).where(eq(employerSubscriptions.userId, userId)).limit(1);
  return row ?? null;
}

async function upsertEmployerSubscription(
  userId: string,
  tier: EmployerSubscriptionTierId,
  subscriptionId: string,
  currentPeriodEnd: Date,
  status: string,
) {
  const tierConfig = await getEmployerTierConfig(tier);
  const existing = await getExistingEmployerSubscription(userId);

  if (existing) {
    await db.update(employerSubscriptions).set({
      tier,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      status,
      activeListingsLimit: tierConfig.listings,
      updatedAt: new Date(),
    }).where(eq(employerSubscriptions.userId, userId));
  } else {
    await db.insert(employerSubscriptions).values({
      userId,
      tier,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd,
      status,
      activeListingsLimit: tierConfig.listings,
    });
  }
}

async function resolveSubscriptionTier(userId: string, subscription: Stripe.Subscription): Promise<EmployerSubscriptionTierId> {
  const metadataTier = subscription.metadata?.['tier'];
  if (metadataTier === 'free' || metadataTier === 'starter' || metadataTier === 'pro' || metadataTier === 'enterprise') {
    return metadataTier;
  }

  const existing = await getExistingEmployerSubscription(userId);
  const existingTier = existing?.tier;
  if (existingTier === 'free' || existingTier === 'starter' || existingTier === 'pro' || existingTier === 'enterprise') {
    return existingTier;
  }

  return 'starter';
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env['STRIPE_WEBHOOK_SECRET'] ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { metadata } = session;

      if (session.customer && typeof session.customer === 'string') {
        const ownerId = metadata?.['userId'] ?? metadata?.['employerId'];
        if (ownerId) {
          await persistStripeCustomerId(ownerId, session.customer);
        }
      }

      if (metadata?.['courseId'] && metadata?.['userId'] && session.payment_status === 'paid') {
        const userId = metadata['userId']!;
        const courseId = metadata['courseId']!;
        const rawPi = session.payment_intent;
        const paymentIntentId = typeof rawPi === 'string' ? rawPi : rawPi?.id ?? session.id;

        const [existingPayment] = await db.select({ id: paymentsTable.id }).from(paymentsTable)
          .where(eq(paymentsTable.stripePaymentIntentId, paymentIntentId)).limit(1);

        const [courseData] = await db.select({ id: courses.id, title: courses.title, priceGbp: courses.priceGbp })
          .from(courses).where(eq(courses.id, courseId)).limit(1);

        if (courseData && !existingPayment) {
          const [existingEnrollment] = await db.select({ id: enrollments.id }).from(enrollments)
            .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).limit(1);

          if (!existingEnrollment) {
            await db.insert(enrollments).values({
              userId, courseId, stripePaymentIntentId: paymentIntentId, progressPercent: 0,
            });
            await db.update(courses).set({
              enrollmentsCount: sql`${courses.enrollmentsCount} + 1`, updatedAt: new Date(),
            }).where(eq(courses.id, courseId));
          }

          await db.insert(paymentsTable).values({
            userId,
            stripePaymentIntentId: paymentIntentId,
            amountPence: session.amount_total ?? 0,
            currency: session.currency ?? 'gbp',
            status: 'completed',
            description: `Course enrolment: ${courseData.title}`,
            metadata: { courseId, sessionId: session.id },
          });
        }
      }

      if (metadata?.['productType'] === 'employer_subscription') {
        const userId = metadata['userId'] ?? '';
        const tier = (metadata['tier'] ?? 'starter') as EmployerSubscriptionTierId;
        const subscriptionId = session.subscription as string;

        if (subscriptionId && userId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertEmployerSubscription(
            userId,
            tier,
            subscriptionId,
            new Date(sub.current_period_end * 1000),
            'active',
          );
          await db.insert(notifications).values({
            userId,
            type: 'subscription_activated',
            title: 'Subscription activated',
            body: `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan is now active. You can post jobs immediately.`,
            read: false,
            link: '/employers/dashboard',
          });
        }
      }

      if (metadata?.['employerId'] && metadata?.['packageType']) {
        const employerId = metadata['employerId'];
        const packageType = metadata['packageType'] as JobPostingPackageId;
        const paymentIntentId = session.payment_intent as string;
        const [existingPayment] = await db.select({ id: paymentsTable.id }).from(paymentsTable)
          .where(eq(paymentsTable.stripePaymentIntentId, paymentIntentId)).limit(1);

        if (!existingPayment) {
          const packageConfig = await getJobPackageConfig(packageType);
          const existingSubscription = await getExistingEmployerSubscription(employerId);

          if (existingSubscription) {
            await db.update(employerSubscriptions).set({
              activeListingsLimit: (existingSubscription.activeListingsLimit ?? 0) + packageConfig.listingCount,
              updatedAt: new Date(),
            }).where(eq(employerSubscriptions.userId, employerId));
          } else {
            const freeTier = await getEmployerTierConfig('free');
            await db.insert(employerSubscriptions).values({
              userId: employerId,
              tier: 'free',
              status: 'active',
              activeListingsLimit: freeTier.listings + packageConfig.listingCount,
            });
          }

          await db.insert(paymentsTable).values({
            userId: employerId,
            stripePaymentIntentId: paymentIntentId,
            amountPence: session.amount_total ?? 0,
            currency: session.currency ?? 'gbp',
            status: 'completed',
            description: `Job posting package: ${packageConfig.label} (${packageConfig.listingCount} listing${packageConfig.listingCount > 1 ? 's' : ''})`,
            metadata: { packageType, listingCount: packageConfig.listingCount, sessionId: session.id },
          });
        }
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await getUserByCustomerId(customerId);

      if (user) {
        const tier = await resolveSubscriptionTier(user.id, subscription);
        await upsertEmployerSubscription(
          user.id,
          tier,
          subscription.id,
          new Date(subscription.current_period_end * 1000),
          subscription.status,
        );
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const user = await getUserByCustomerId(subscription.customer as string);

        if (user) {
          const [existingPayment] = await db.select({ id: paymentsTable.id }).from(paymentsTable)
            .where(eq(paymentsTable.stripePaymentIntentId, invoice.id)).limit(1);

          if (!existingPayment) {
            await db.insert(paymentsTable).values({
              userId: user.id,
              stripePaymentIntentId: invoice.id,
              amountPence: invoice.amount_paid,
              currency: invoice.currency,
              status: 'completed',
              description: 'Subscription renewal',
              metadata: { subscriptionId: invoice.subscription },
            });
          }

          const tier = await resolveSubscriptionTier(user.id, subscription);
          await upsertEmployerSubscription(
            user.id,
            tier,
            subscription.id,
            new Date(subscription.current_period_end * 1000),
            'active',
          );
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const user = await getUserByCustomerId(subscription.customer as string);

        if (user) {
          await db.insert(notifications).values({
            userId: user.id,
            type: 'payment_failed',
            title: 'Payment failed',
            body: 'Your subscription payment failed. Please update your payment method to avoid losing access.',
            read: false,
            link: '/employers/dashboard',
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByCustomerId(subscription.customer as string);

      if (user) {
        const freeTier = await getEmployerTierConfig('free');
        await db.update(employerSubscriptions).set({
          tier: 'free',
          status: 'cancelled',
          activeListingsLimit: freeTier.listings,
          updatedAt: new Date(),
        }).where(eq(employerSubscriptions.userId, user.id));

        await db.insert(notifications).values({
          userId: user.id,
          type: 'subscription_cancelled',
          title: 'Subscription cancelled',
          body: 'Your subscription has been cancelled. You have been moved to the free tier (1 active listing).',
          read: false,
          link: '/employers/pricing',
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
