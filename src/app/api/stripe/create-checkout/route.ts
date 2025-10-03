import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a one-time $1 trial price
    const trialPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: 100, // $1 in cents
      product_data: {
        name: 'Casting Companion Pro - 14 Day Trial',
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      payment_method_types: ['card'],
      line_items: [
        {
          price: trialPrice.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/onboarding/step1?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/onboarding/payment`,
      metadata: {
        userId: (session.user as any).id,
        isTrial: 'true',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
