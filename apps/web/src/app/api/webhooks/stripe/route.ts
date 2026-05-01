import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripeClient() {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

function getSupabaseClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  );
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

      if (metadata?.['courseId']) {
        const userId = metadata['userId'];
        const courseId = metadata['courseId'];
        const paymentIntentId = session.payment_intent as string;

        const { data: courseData } = await supabase
          .from('courses')
          .select('id, title, price_gbp, cpd_hours, instructor_id')
          .eq('id', courseId)
          .single();

        if (courseData) {
          await supabase.from('enrollments').insert({
            user_id: userId,
            course_id: courseId,
            stripe_payment_intent_id: paymentIntentId,
            progress_percent: 0,
          });

          await supabase.rpc('increment_course_enrollments', { course_id: courseId });

          await supabase.from('payments').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntentId,
            amount_pence: session.amount_total ?? 0,
            currency: session.currency ?? 'gbp',
            status: 'completed',
            description: `Course enrollment: ${courseData.title}`,
            metadata: { courseId, sessionId: session.id },
          });
        }
      }

      if (metadata?.['employerId'] && metadata?.['packageType']) {
        const employerId = metadata['employerId'];
        const packageType = metadata['packageType'];
        const paymentIntentId = session.payment_intent as string;

        const listingCount = packageType === 'triple' ? 3 : 1;

        await supabase.from('payments').insert({
          user_id: employerId,
          stripe_payment_intent_id: paymentIntentId,
          amount_pence: session.amount_total ?? 0,
          currency: session.currency ?? 'gbp',
          status: 'completed',
          description: `Job posting package: ${packageType} (${listingCount} listing${listingCount > 1 ? 's' : ''})`,
          metadata: { packageType, listingCount, sessionId: session.id },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = subscription.customer as string;

        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .limit(1);

        if (users?.[0]) {
          await supabase.from('payments').insert({
            user_id: users[0].id,
            stripe_payment_intent_id: invoice.id,
            amount_pence: invoice.amount_paid,
            currency: invoice.currency,
            status: 'completed',
            description: `Subscription renewal`,
            metadata: { subscriptionId: invoice.subscription },
          });
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = subscription.customer as string;

        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .limit(1);

        if (users?.[0]) {
          await supabase.from('notifications').insert({
            user_id: users[0].id,
            type: 'payment_failed',
            title: 'Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method.',
            read: false,
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .limit(1);

      if (users?.[0]) {
        await supabase.from('notifications').insert({
          user_id: users[0].id,
          type: 'subscription_cancelled',
          title: 'Subscription Cancelled',
          body: 'Your subscription has been cancelled. You have been moved to the free tier.',
          read: false,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
