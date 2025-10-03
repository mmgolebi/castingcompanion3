import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const isTrial = session.metadata?.isTrial === 'true';

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        console.log('Checkout completed for user:', userId);

        if (isTrial) {
          // This is the $1 trial payment
          const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

          // Create the main $39.97 recurring subscription that starts after trial
          const mainPrice = await stripe.prices.create({
            currency: 'usd',
            unit_amount: 3997, // $39.97
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'Casting Companion Pro',
            },
          });

          const subscription = await stripe.subscriptions.create({
            customer: session.customer as string,
            items: [{ price: mainPrice.id }],
            trial_end: Math.floor(trialEndDate.getTime() / 1000),
            metadata: {
              userId: userId,
            },
          });

          // Update user with trial info
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubId: subscription.id,
              subStatus: 'TRIAL',
              trialEndsAt: trialEndDate,
            },
          });

          console.log(`Trial subscription created for user ${userId}, starts billing on ${trialEndDate}`);
        }

        // Get user profile for auto-submission
        const userProfile = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            age: true,
            playableAgeMin: true,
            playableAgeMax: true,
            gender: true,
            state: true,
            city: true,
            unionStatus: true,
            ethnicity: true,
            roleTypesInterested: true,
            phone: true,
            headshot: true,
            fullBody: true,
            resume: true,
            demoReel: true,
            skills: true,
          },
        });

        if (!userProfile) {
          console.error('User profile not found:', userId);
          break;
        }

        // Get all active casting calls
        const castingCalls = await prisma.castingCall.findMany({
          where: {
            submissionDeadline: {
              gte: new Date(),
            },
          },
        });

        console.log(`Checking ${castingCalls.length} casting calls for auto-submission`);

        // Auto-submit to matching casting calls
        for (const call of castingCalls) {
          const matchScore = calculateMatchScore(userProfile, call);
          console.log(`Match score for ${call.title}: ${matchScore}%`);

          if (matchScore >= 85) {
            console.log(`Auto-submitting to: ${call.title}`);

            await prisma.submission.create({
              data: {
                userId: userProfile.id,
                callId: call.id,
                status: 'SENT',
                method: 'AUTO',
                matchScore,
                castingEmail: call.castingEmail,
              },
            });

            try {
              await sendSubmissionEmail({
                castingEmail: call.castingEmail,
                userProfile,
                castingCall: call,
                submissionId: call.id,
              });
              console.log(`Submission email sent for ${call.title}`);
            } catch (emailError) {
              console.error('Failed to send submission email:', emailError);
            }
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subStatus: subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED',
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subStatus: 'CANCELLED',
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
