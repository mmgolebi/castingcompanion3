import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendWelcomeEmail } from '@/lib/email';
import { addGHLTag } from '@/lib/ghl';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// CRITICAL: Tell Next.js not to parse the body
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text(); // Get raw text body
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Checkout completed for user:', session.metadata?.userId);
        
        if (session.metadata?.userId) {
          const user = await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
            },
          });

          console.log('User updated, adding GHL paid tag to:', user.email);

          // Add "paid" tag to GHL (non-blocking)
          addGHLTag(user.email, 'paid')
            .then(() => {
              console.log('GHL paid tag added successfully for:', user.email);
            })
            .catch(error => {
              console.error('GHL paid tag failed for', user.email, ':', error);
            });

          // Send welcome email after successful payment
          try {
            await sendWelcomeEmail(user.email, user.name || 'Actor');
            console.log('Welcome email sent to:', user.email);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        } else {
          console.error('No userId in session metadata');
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Subscription event:', event.type, 'for customer:', subscription.customer);
        
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
          },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
