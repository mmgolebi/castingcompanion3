import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubId: subscription.id,
            subStatus: 'TRIAL',
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            billingAnchor: new Date(subscription.current_period_end * 1000),
          },
        });

        await sendWelcomeEmail(user.email, user.name || undefined);
        
        console.log('✅ Checkout completed for user:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          const user = await prisma.user.findFirst({
            where: { stripeSubId: subscription.id },
          });

          if (!user) {
            console.error('User not found for subscription:', subscription.id);
            break;
          }

          await updateSubscriptionStatus(user.id, subscription);
        } else {
          await updateSubscriptionStatus(userId, subscription);
        }
        
        console.log('✅ Subscription updated for user:', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const user = await prisma.user.findFirst({
          where: { stripeSubId: subscription.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subStatus: 'CANCELED',
            },
          });
          console.log('✅ Subscription canceled for user:', user.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function updateSubscriptionStatus(
  userId: string,
  subscription: Stripe.Subscription
) {
  let subStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INACTIVE' =
    'INACTIVE';

  switch (subscription.status) {
    case 'trialing':
      subStatus = 'TRIAL';
      break;
    case 'active':
      subStatus = 'ACTIVE';
      break;
    case 'past_due':
      subStatus = 'PAST_DUE';
      break;
    case 'canceled':
    case 'unpaid':
      subStatus = 'CANCELED';
      break;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subStatus,
      billingAnchor: new Date(subscription.current_period_end * 1000),
    },
  });
}