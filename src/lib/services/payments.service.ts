import Stripe from 'stripe';
import { db } from '@/lib/db';
import { courses, employerSubscriptions } from '@bukz/db';
import { eq } from 'drizzle-orm';
import { getEmployerSubscriptionTier, getJobPostingPackage } from './settings.service';
import { capture } from '@/lib/analytics';
import type { EmployerSubscriptionTierId, JobPostingPackageId } from '@bukz/db';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '');
const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

export async function getEmployerSubscription(userId: string) {
  const [sub] = await db.select().from(employerSubscriptions).where(eq(employerSubscriptions.userId, userId)).limit(1);
  return sub ?? null;
}

export async function createEmployerSubscriptionCheckout(userId: string, tier: Exclude<EmployerSubscriptionTierId, 'free'>, userEmail?: string) {
  const plan = await getEmployerSubscriptionTier(tier);
  capture(userId, 'employer_subscription_checkout_started', { tier });

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    ...(userEmail ? { customer_email: userEmail } : {}),
    line_items: [{
      price_data: {
        currency: 'gbp',
        unit_amount: plan.priceMonthlyPence,
        product_data: { name: `BUKZ Jobs ${plan.label} — Monthly subscription` },
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    metadata: { userId, tier, productType: 'employer_subscription' },
    subscription_data: { metadata: { userId, tier, productType: 'employer_subscription' } },
    success_url: `${APP_URL}/employers/dashboard?subscribed=true`,
    cancel_url: `${APP_URL}/employers/pricing`,
  });
}

export async function upsertEmployerSubscription(userId: string, tier: EmployerSubscriptionTierId, stripeSubscriptionId: string | null, currentPeriodEnd: Date | null) {
  const tierSettings = await getEmployerSubscriptionTier(tier);
  const [existing] = await db.select().from(employerSubscriptions).where(eq(employerSubscriptions.userId, userId)).limit(1);

  if (existing) {
    const [updated] = await db.update(employerSubscriptions)
      .set({ tier, stripeSubscriptionId, currentPeriodEnd, updatedAt: new Date(), activeListingsLimit: tierSettings.listings })
      .where(eq(employerSubscriptions.userId, userId)).returning();
    return updated;
  }

  const [created] = await db.insert(employerSubscriptions)
    .values({ userId, tier, stripeSubscriptionId, currentPeriodEnd, activeListingsLimit: tierSettings.listings })
    .returning();
  return created;
}

export async function createJobPostingCheckout(employerId: string, packageType: JobPostingPackageId, userEmail?: string) {
  const pkg = await getJobPostingPackage(packageType);
  capture(employerId, 'job_posting_checkout_started', { packageType });

  return stripe.checkout.sessions.create({
    mode: pkg.recurringInterval ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    ...(userEmail ? { customer_email: userEmail } : {}),
    line_items: [{
      price_data: {
        currency: 'gbp',
        unit_amount: pkg.pricePence,
        product_data: { name: `BUKZ Jobs — ${pkg.label}` },
        ...(pkg.recurringInterval ? { recurring: { interval: pkg.recurringInterval } } : {}),
      },
      quantity: 1,
    }],
    metadata: { employerId, packageType },
    success_url: `${APP_URL}/employers/dashboard?payment=success`,
    cancel_url: `${APP_URL}/employers/post-job?step=4`,
  });
}

export async function createCourseCheckout(userId: string, courseId: string, userEmail?: string) {
  const [course] = await db.select({ id: courses.id, title: courses.title, slug: courses.slug, status: courses.status, priceGbp: courses.priceGbp })
    .from(courses).where(eq(courses.id, courseId)).limit(1);

  if (!course) throw new Error('Course not found');
  if (course.status !== 'published') throw new Error('Course is not available for checkout');

  const amountPence = Math.round(Number(course.priceGbp) * 100);
  if (amountPence <= 0) throw new Error('Free courses do not require checkout');

  capture(userId, 'course_checkout_started', { courseId, courseTitle: course.title, amountPence });

  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    ...(userEmail ? { customer_email: userEmail } : {}),
    line_items: [{
      price_data: { currency: 'gbp', unit_amount: amountPence, product_data: { name: `BUKZ Learn — ${course.title}` } },
      quantity: 1,
    }],
    metadata: { userId, courseId },
    success_url: `${APP_URL}/dashboard/learn?enrolled=${courseId}`,
    cancel_url: `${APP_URL}/learn/${course.slug}`,
  });
}
