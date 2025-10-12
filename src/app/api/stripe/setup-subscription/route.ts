import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      console.error('Setup subscription: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('Setup subscription: User not found', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if price ID exists
    if (!process.env.STRIPE_PRICE_ID_MONTHLY) {
      console.error('Setup subscription: STRIPE_PRICE_ID_MONTHLY not configured');
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 });
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      console.log('Creating new Stripe customer for:', user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      console.log('Created customer:', customerId);
    }

    // Create subscription with 14-day trial
    console.log('Creating subscription with price:', process.env.STRIPE_PRICE_ID_MONTHLY);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY }],
      trial_period_days: 14,
    });

    console.log('Subscription created:', subscription.id, 'Status:', subscription.status);

    // Update user with Stripe info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : 'active',
      },
    });

    console.log('User updated successfully');

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (error: any) {
    console.error('Setup subscription error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to setup subscription',
      details: error.message 
    }, { status: 500 });
  }
}
