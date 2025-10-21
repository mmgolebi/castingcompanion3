import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendWelcomeEmail } from '@/lib/email';
import { addGHLTag } from '@/lib/ghl';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[WEBHOOK] Starting webhook handler');
  
  let body: string;
  try {
    body = await req.text();
    console.log('[WEBHOOK] Body length:', body.length);
  } catch (error) {
    console.error('[WEBHOOK] Failed to read body:', error);
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('[WEBHOOK] Signature present:', !!signature);

  if (!signature) {
    console.error('[WEBHOOK] No stripe-signature header found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log('[WEBHOOK] Attempting to verify signature...');
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('[WEBHOOK] Signature verified! Event type:', event.type);
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[WEBHOOK] Processing event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[WEBHOOK] Checkout completed for user:', session.metadata?.userId);
        
        if (session.metadata?.userId) {
          const user = await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
            },
          });

          console.log('[WEBHOOK] User updated, adding GHL paid tag to:', user.email);

          // Add paid tag with all cumulative tags
          addGHLTag(
            user.email, 
            'paid',
            ['registered', 'euphoria-applicant', 'step4-complete', 'payment-page-viewed', 'paid'] // All tags
          )
            .then(() => {
              console.log('[WEBHOOK] GHL paid tag added successfully for:', user.email);
            })
            .catch(error => {
              console.error('[WEBHOOK] GHL paid tag failed for', user.email, ':', error);
            });

          try {
            await sendWelcomeEmail(user.email, user.name || 'Actor');
            console.log('[WEBHOOK] Welcome email sent to:', user.email);
          } catch (emailError) {
            console.error('[WEBHOOK] Failed to send welcome email:', emailError);
          }
        } else {
          console.error('[WEBHOOK] No userId in session metadata');
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('[WEBHOOK] Subscription event:', event.type, 'for customer:', subscription.customer);
        
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
          },
        });
        break;

      default:
        console.log('[WEBHOOK] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
