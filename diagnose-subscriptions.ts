import { prisma } from './src/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

async function diagnoseSubscriptions() {
  const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE';
  console.log(`🔑 Stripe Mode: ${stripeMode}\n`);

  // Find users with trialing status
  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ['trialing', 'active'] },
      stripeCustomerId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 5, // Just check first 5
  });

  console.log(`Found ${users.length} recent users to check\n`);

  for (const user of users) {
    console.log(`\n👤 ${user.email}`);
    console.log(`   DB Status: ${user.subscriptionStatus}`);
    console.log(`   DB Customer ID: ${user.stripeCustomerId}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);

    // Try to get customer from Stripe
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId!);
      console.log(`   ✅ Customer exists in Stripe ${stripeMode} mode`);

      // Get subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId!,
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        console.log(`   📋 Subscription: ${sub.id}`);
        console.log(`   📊 Status: ${sub.status}`);
        console.log(`   💳 Payment Method: ${sub.default_payment_method || '❌ NONE'}`);
        
        if (sub.trial_end) {
          console.log(`   📅 Trial End: ${new Date(sub.trial_end * 1000).toLocaleString()}`);
        }
      } else {
        console.log(`   ⚠️  No subscriptions found`);
      }

      // Check for payment intents
      const paymentIntents = await stripe.paymentIntents.list({
        customer: user.stripeCustomerId!,
        limit: 5,
      });

      console.log(`   💰 Payment Intents: ${paymentIntents.data.length}`);
      paymentIntents.data.forEach(pi => {
        console.log(`      - $${pi.amount/100} (${pi.status}) - PM: ${pi.payment_method || 'none'}`);
      });

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 This customer ID doesn't exist in ${stripeMode} mode`);
    }
  }
}

diagnoseSubscriptions().catch(console.error);
