import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY! }],
      trial_period_days: 14,
    });

    // Update user with Stripe info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : 'active',
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error('Setup subscription error:', error);
    return NextResponse.json({ error: 'Failed to setup subscription' }, { status: 500 });
  }
}
