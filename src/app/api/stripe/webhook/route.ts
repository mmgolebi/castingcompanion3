import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

function calculateMatchScore(call: any, user: any): number {
  let score = 50;

  if (user.state && call.location.includes(user.state)) {
    score += 20;
  }

  if (call.unionReq === 'ANY' || user.unionStatus === call.unionReq || call.unionReq === 'EITHER') {
    score += 15;
  }

  if (user.age && call.ageMin && call.ageMax) {
    if (user.age >= call.ageMin && user.age <= call.ageMax) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubId: session.subscription as string,
            subStatus: 'TRIAL',
            trialEndsAt: new Date(subscription.trial_end! * 1000),
            onboardingComplete: true,
          },
        });

        // Get user profile for auto-submission
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            state: true,
            unionStatus: true,
            age: true,
            gender: true,
          },
        });

        // Find high-match casting calls (85%+)
        const allCalls = await prisma.castingCall.findMany({
          where: {
            submissionDeadline: {
              gte: new Date(),
            },
          },
        });

        for (const call of allCalls) {
          const matchScore = calculateMatchScore(call, user);
          
          if (matchScore >= 85) {
            // Auto-submit to high-match calls
            await prisma.submission.create({
              data: {
                userId,
                callId: call.id,
                status: 'SENT',
                method: 'AUTO',
                matchScore,
                castingEmail: call.castingEmail,
              },
            });
            
            console.log(`Auto-submitted user ${userId} to ${call.title} (${matchScore}% match)`);
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        let subStatus: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELED' = 'ACTIVE';
        if (subscription.status === 'trialing') subStatus = 'TRIAL';
        if (subscription.status === 'past_due') subStatus = 'PAST_DUE';
        if (subscription.status === 'canceled') subStatus = 'CANCELED';

        await prisma.user.update({
          where: { stripeSubId: subscription.id },
          data: { subStatus },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.user.update({
          where: { stripeSubId: subscription.id },
          data: { subStatus: 'CANCELED' },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
