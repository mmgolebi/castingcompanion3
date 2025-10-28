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

    const { checkoutSessionId } = await req.json();

    if (!checkoutSessionId) {
      console.error('Setup subscription: No checkout session ID provided');
      return NextResponse.json({ error: 'Checkout session ID required' }, { status: 400 });
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

    // Retrieve the checkout session to get payment method
    console.log('Retrieving checkout session:', checkoutSessionId);
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['payment_intent.payment_method'],
    });

    if (!checkoutSession.payment_intent) {
      console.error('No payment intent found in checkout session');
      return NextResponse.json({ error: 'No payment found' }, { status: 400 });
    }

    // Get the payment method from the payment intent
    const paymentIntent = checkoutSession.payment_intent as Stripe.PaymentIntent;
    const paymentMethodId = typeof paymentIntent.payment_method === 'string' 
      ? paymentIntent.payment_method 
      : paymentIntent.payment_method?.id;

    if (!paymentMethodId) {
      console.error('No payment method found');
      return NextResponse.json({ error: 'No payment method found' }, { status: 400 });
    }

    console.log('Found payment method:', paymentMethodId);

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      console.log('Creating new Stripe customer for:', user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      customerId = customer.id;
      console.log('Created customer:', customerId);
    } else {
      // Attach payment method to existing customer
      console.log('Attaching payment method to existing customer:', customerId);
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription with 14-day trial AND payment method
    console.log('Creating subscription with price:', process.env.STRIPE_PRICE_ID_MONTHLY);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY }],
      trial_period_days: 14,
      default_payment_method: paymentMethodId,
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
