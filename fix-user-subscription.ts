import { prisma } from './src/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function fixUserSubscription() {
  const email = 'eubanks.zechariah@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Current status in DB:', user.subscriptionStatus);

  if (user.stripeCustomerId) {
    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const actualStatus = subscriptions.data[0].status;
      console.log('Actual status in Stripe:', actualStatus);

      await prisma.user.update({
        where: { email },
        data: { subscriptionStatus: actualStatus },
      });

      console.log('✅ Fixed! Updated to:', actualStatus);
    }
  }
}

fixUserSubscription();
