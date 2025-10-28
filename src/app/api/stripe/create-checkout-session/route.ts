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

    // Create checkout for $1 one-time payment with EMBEDDED mode
    // CRITICAL: setup_future_usage saves the payment method for the subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_TRIAL_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'off_session', // ✅ CRITICAL: Saves payment method for future charges
      },
      return_url: `${process.env.NEXTAUTH_URL}/onboarding/setup-subscription?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.id,
        isTrial: 'true',
      },
    });

    return NextResponse.json({ clientSecret: checkoutSession.client_secret });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
