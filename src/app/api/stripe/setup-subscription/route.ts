import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Casting Companion Pro',
            },
            unit_amount: 3997, // $39.97 in cents
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      trial_period_days: 30,
      metadata: {
        userId: (session.user as any).id,
      },
    });

    // Update user in database
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        stripeCustomerId: customerId,
        stripeSubId: subscription.id,
        subStatus: 'TRIAL',
        trialEndsAt: new Date(subscription.trial_end! * 1000),
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error: any) {
    console.error('Setup subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup subscription' },
      { status: 500 }
    );
  }
}
