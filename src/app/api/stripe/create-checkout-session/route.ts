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
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // EMBEDDED MODE
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 100, // $1 in cents
            product_data: {
              name: 'Casting Companion Pro - Trial Access',
              description: '$1 trial, then $39.97/month after 14 days',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${process.env.NEXTAUTH_URL}/onboarding/setup-subscription?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.id,
        isTrial: 'true',
      },
    });

    // Return clientSecret instead of url for embedded checkout
    return NextResponse.json({ clientSecret: checkoutSession.client_secret });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
