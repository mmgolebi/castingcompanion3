import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email!;

    // Use setup mode to collect payment method, then we'll charge it manually
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      mode: 'setup',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/setup-subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/payment`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
