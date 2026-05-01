import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
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
} from '@bukz/db';

function getStripeClient() {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

function getSupabaseClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  );
}

async function getUserByCustomerId(supabase: ReturnType<typeof getSupabaseClient>, customerId: string) {
  const { data } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).limit(1);
  return data?.[0] ?? null;
}

async function getPlatformSetting<K extends PlatformSettingKey>(
  supabase: ReturnType<typeof getSupabaseClient>,
  key: K,
) {
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', key)
    .limit(1);

  const rawValue = data?.[0]?.value;
  if (rawValue === undefined) {
    return getPlatformSettingDefault(key);
  }

  try {
    return parsePlatformSettingValue(key, rawValue);
  } catch {
    return getPlatformSettingDefault(key);
  }
}

async function getEmployerTierConfig(
  supabase: ReturnType<typeof getSupabaseClient>,
  tier: EmployerSubscriptionTierId,
): Promise<EmployerSubscriptionTierSetting> {
  return await getPlatformSetting(
    supabase,
    getEmployerSubscriptionSettingKey(tier),
  ) as EmployerSubscriptionTierSetting;
}

async function getJobPackageConfig(
  supabase: ReturnType<typeof getSupabaseClient>,
  packageType: JobPostingPackageId,
): Promise<JobPostingPackageSetting> {
  return await getPlatformSetting(
    supabase,
    getJobPostingPackageSettingKey(packageType),
  ) as JobPostingPackageSetting;
}

async function persistStripeCustomerId(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  customerId: string,
) {
  await supabase
    .from('users')
    .update({ stripe_customer_id: customerId })
    .eq('id', userId);
}

async function getExistingEmployerSubscription(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
) {
  const { data } = await supabase
    .from('employer_subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .limit(1);

  return data?.[0] ?? null;
}

async function upsertEmployerSubscription(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  tier: EmployerSubscriptionTierId,
  subscriptionId: string,
  currentPeriodEnd: Date,
  status: string,
) {
  const tierConfig = await getEmployerTierConfig(supabase, tier);
  const { data: existing } = await supabase
    .from('employer_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing?.[0]) {
    await supabase
      .from('employer_subscriptions')
      .update({
        tier,
        stripe_subscription_id: subscriptionId,
        current_period_end: currentPeriodEnd.toISOString(),
        status,
        active_listings_limit: tierConfig.listings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    await supabase.from('employer_subscriptions').insert({
      user_id: userId,
      tier,
      stripe_subscription_id: subscriptionId,
      current_period_end: currentPeriodEnd.toISOString(),
      status,
      active_listings_limit: tierConfig.listings,
    });
  }
}

async function resolveSubscriptionTier(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  subscription: Stripe.Subscription,
): Promise<EmployerSubscriptionTierId> {
  const metadataTier = subscription.metadata?.['tier'];
  if (metadataTier === 'free' || metadataTier === 'starter' || metadataTier === 'pro' || metadataTier === 'enterprise') {
    return metadataTier;
  }

  const existing = await getExistingEmployerSubscription(supabase, userId);
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
  const supabase = getSupabaseClient();

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
          await persistStripeCustomerId(supabase, ownerId, session.customer);
        }
      }

      if (metadata?.['courseId']) {
        const userId = metadata['userId'];
        const courseId = metadata['courseId'];
        const paymentIntentId = session.payment_intent as string;
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .limit(1);

        const { data: courseData } = await supabase
          .from('courses')
          .select('id, title, price_gbp, cpd_hours')
          .eq('id', courseId)
          .single();

        if (courseData && !existingPayment?.[0]) {
          const { data: existingEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .limit(1);

          if (!existingEnrollment?.[0]) {
            await supabase.from('enrollments').insert({
              user_id: userId,
              course_id: courseId,
              stripe_payment_intent_id: paymentIntentId,
              progress_percent: 0,
            });
            await supabase.rpc('increment_course_enrollments', { course_id: courseId });
          }

          await supabase.from('payments').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntentId,
            amount_pence: session.amount_total ?? 0,
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
            supabase,
            userId,
            tier,
            subscriptionId,
            new Date(sub.current_period_end * 1000),
            'active',
          );
          await supabase.from('notifications').insert({
            user_id: userId,
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
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .limit(1);

        if (!existingPayment?.[0]) {
          const packageConfig = await getJobPackageConfig(supabase, packageType);
          const { data: subscriptionRows } = await supabase
            .from('employer_subscriptions')
            .select('id, active_listings_limit')
            .eq('user_id', employerId)
            .limit(1);

          if (subscriptionRows?.[0]) {
            await supabase
              .from('employer_subscriptions')
              .update({
                active_listings_limit: (subscriptionRows[0].active_listings_limit ?? 0) + packageConfig.listingCount,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', employerId);
          } else {
            const freeTier = await getEmployerTierConfig(supabase, 'free');
            await supabase.from('employer_subscriptions').insert({
              user_id: employerId,
              tier: 'free',
              status: 'active',
              active_listings_limit: freeTier.listings + packageConfig.listingCount,
            });
          }

          await supabase.from('payments').insert({
            user_id: employerId,
            stripe_payment_intent_id: paymentIntentId,
            amount_pence: session.amount_total ?? 0,
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
      const user = await getUserByCustomerId(supabase, customerId);

      if (user) {
        const tier = await resolveSubscriptionTier(supabase, user.id, subscription);
        await upsertEmployerSubscription(
          supabase,
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
        const user = await getUserByCustomerId(supabase, subscription.customer as string);

        if (user) {
          const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_payment_intent_id', invoice.id)
            .limit(1);

          if (!existingPayment?.[0]) {
            await supabase.from('payments').insert({
              user_id: user.id,
              stripe_payment_intent_id: invoice.id,
              amount_pence: invoice.amount_paid,
              currency: invoice.currency,
              status: 'completed',
              description: 'Subscription renewal',
              metadata: { subscriptionId: invoice.subscription },
            });
          }

          const tier = await resolveSubscriptionTier(supabase, user.id, subscription);
          await upsertEmployerSubscription(
            supabase,
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
        const user = await getUserByCustomerId(supabase, subscription.customer as string);

        if (user) {
          await supabase.from('notifications').insert({
            user_id: user.id,
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
      const user = await getUserByCustomerId(supabase, subscription.customer as string);

      if (user) {
        const freeTier = await getEmployerTierConfig(supabase, 'free');
        await supabase
          .from('employer_subscriptions')
          .update({
            tier: 'free',
            status: 'cancelled',
            active_listings_limit: freeTier.listings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        await supabase.from('notifications').insert({
          user_id: user.id,
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
