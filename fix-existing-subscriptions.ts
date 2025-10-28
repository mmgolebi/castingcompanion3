import { prisma } from './src/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

async function fixExistingSubscriptions() {
  console.log('🔍 Finding users with active trials...\n');

  // Find users with trialing status and a Stripe customer ID
  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'trialing',
      stripeCustomerId: { not: null },
    },
  });

  console.log(`Found ${users.length} users with active trials\n`);

  for (const user of users) {
    try {
      console.log(`\n👤 Processing: ${user.email} (Customer: ${user.stripeCustomerId})`);

      // Get the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId!,
        limit: 10,
      });

      if (subscriptions.data.length === 0) {
        console.log('   ⚠️  No subscriptions found');
        continue;
      }

      const subscription = subscriptions.data[0];
      console.log(`   📋 Subscription: ${subscription.id} (Status: ${subscription.status})`);
      console.log(`   📅 Trial ends: ${new Date(subscription.trial_end! * 1000).toLocaleString()}`);

      // Check if subscription already has a payment method
      if (subscription.default_payment_method) {
        console.log(`   ✅ Already has payment method: ${subscription.default_payment_method}`);
        continue;
      }

      console.log('   🔍 No payment method found, searching for original $1 payment...');

      // Search for the original $1 payment
      const paymentIntents = await stripe.paymentIntents.list({
        customer: user.stripeCustomerId!,
        limit: 10,
      });

      // Find the $1 payment (100 cents)
      const trialPayment = paymentIntents.data.find(pi => pi.amount === 100 && pi.status === 'succeeded');

      if (!trialPayment) {
        console.log('   ❌ Could not find original $1 payment');
        continue;
      }

      const paymentMethodId = trialPayment.payment_method as string;
      
      if (!paymentMethodId) {
        console.log('   ❌ No payment method on $1 payment');
        continue;
      }

      console.log(`   💳 Found payment method: ${paymentMethodId}`);

      // Check if payment method is already attached to customer
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        
        if (paymentMethod.customer !== user.stripeCustomerId) {
          console.log('   🔗 Attaching payment method to customer...');
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId!,
          });
        }
      } catch (error: any) {
        if (error.code === 'resource_already_attached') {
          console.log('   ✅ Payment method already attached');
        } else {
          throw error;
        }
      }

      // Set as default for customer
      console.log('   🎯 Setting as default payment method for customer...');
      await stripe.customers.update(user.stripeCustomerId!, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update the subscription to use this payment method
      console.log('   🎯 Setting as default payment method for subscription...');
      await stripe.subscriptions.update(subscription.id, {
        default_payment_method: paymentMethodId,
      });

      console.log(`   ✅ Successfully fixed subscription for ${user.email}`);

    } catch (error: any) {
      console.error(`   ❌ Error fixing ${user.email}:`, error.message);
    }
  }

  console.log('\n✨ Done!');
}

fixExistingSubscriptions().catch(console.error);
