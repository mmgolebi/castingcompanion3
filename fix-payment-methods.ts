import { prisma } from './src/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

async function fixPaymentMethods() {
  console.log('🔧 Fixing payment methods for trialing users...\n');

  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'trialing',
      stripeCustomerId: { not: null },
    },
  });

  console.log(`Found ${users.length} users to fix\n`);

  let fixed = 0;
  let failed = 0;

  for (const user of users) {
    try {
      console.log(`\n👤 ${user.email}`);

      // Get their subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId!,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        console.log('   ⚠️  No subscription found');
        continue;
      }

      const subscription = subscriptions.data[0];
      
      if (subscription.default_payment_method) {
        console.log('   ✅ Already has payment method');
        continue;
      }

      // Search for their $1 payment by searching ALL recent payments
      console.log('   🔍 Searching for $1 payment...');
      
      // Get checkout sessions for this customer
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const userSession = sessions.data.find(s => 
        s.customer === user.stripeCustomerId || s.customer_email === user.email
      );

      if (!userSession?.payment_intent) {
        console.log('   ❌ Could not find checkout session');
        failed++;
        continue;
      }

      // Get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(userSession.payment_intent as string);
      
      if (!paymentIntent.payment_method) {
        console.log('   ❌ No payment method on payment intent');
        failed++;
        continue;
      }

      const paymentMethodId = paymentIntent.payment_method as string;
      console.log(`   💳 Found payment method: ${paymentMethodId}`);

      // Attach to customer (if not already attached)
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: user.stripeCustomerId!,
        });
        console.log('   🔗 Attached payment method to customer');
      } catch (error: any) {
        if (error.code === 'resource_already_attached') {
          console.log('   ✅ Payment method already attached');
        } else {
          throw error;
        }
      }

      // Set as default for customer
      await stripe.customers.update(user.stripeCustomerId!, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      console.log('   🎯 Set as default for customer');

      // Set as default for subscription
      await stripe.subscriptions.update(subscription.id, {
        default_payment_method: paymentMethodId,
      });
      console.log('   🎯 Set as default for subscription');
      console.log(`   ✅ FIXED!`);
      
      fixed++;

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Already OK: ${users.length - fixed - failed}`);
}

fixPaymentMethods().catch(console.error);
