import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

    const body = await req.json();
    const sessionId = body.sessionId;
    const userId = (session.user as any).id;
    const userEmail = session.user.email!;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve the setup session
    const setupSession = await stripe.checkout.sessions.retrieve(sessionId);
    const setupIntentId = setupSession.setup_intent as string;

    // Get the payment method from setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const paymentMethodId = setupIntent.payment_method as string;

    console.log('Payment Method:', paymentMethodId);

    // Create a customer
    const customer = await stripe.customers.create({
      email: userEmail,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      metadata: {
        userId,
      },
    });

    console.log('Customer created:', customer.id);

    // Charge $1 immediately
    await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: '14-Day Trial Access Fee',
      metadata: {
        userId,
        type: 'trial_fee',
      },
    });

    console.log('$1 trial fee charged');

    // Calculate trial end (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    const trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);

    // Create subscription that starts billing in 14 days
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_MONTHLY_PRICE_ID! }],
      default_payment_method: paymentMethodId,
      trial_end: trialEndTimestamp,
      metadata: { userId },
    });

    console.log('Subscription created:', subscription.id);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
        stripeSubId: subscription.id,
        subStatus: 'TRIAL',
        trialEndsAt: trialEndDate,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to set up subscription' },
      { status: 500 }
    );
  }
}
