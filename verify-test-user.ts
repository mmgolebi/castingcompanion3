import { prisma } from './src/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

async function verifyTestUser() {
  const email = 'maciejtest20@test.com';
  
  console.log('🔍 Checking test user setup for billing...\n');
  console.log('=' .repeat(60));
  
  // 1. Check database
  console.log('\n1️⃣ DATABASE CHECK');
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    console.log('❌ User not found in database');
    return;
  }

  console.log(`✅ User exists: ${user.email}`);
  console.log(`   Subscription Status: ${user.subscriptionStatus || 'NONE'}`);
  console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'NONE'}`);
  
  if (!user.stripeCustomerId) {
    console.log('❌ No Stripe customer ID - subscription not set up!');
    return;
  }

  // 2. Check Stripe customer
  console.log('\n2️⃣ STRIPE CUSTOMER CHECK');
  try {
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    console.log(`✅ Customer exists: ${customer.id}`);
    
    if ('deleted' in customer && customer.deleted) {
      console.log('❌ Customer is deleted!');
      return;
    }
  } catch (error) {
    console.log('❌ Customer not found in Stripe');
    return;
  }

  // 3. Check subscription
  console.log('\n3️⃣ SUBSCRIPTION CHECK');
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    console.log('❌ No subscription found!');
    return;
  }

  const sub = subscriptions.data[0];
  console.log(`✅ Subscription exists: ${sub.id}`);
  console.log(`   Status: ${sub.status}`);
  console.log(`   Trial Start: ${new Date(sub.trial_start! * 1000).toLocaleString()}`);
  console.log(`   Trial End: ${new Date(sub.trial_end! * 1000).toLocaleString()}`);
  console.log(`   Current Period End: ${new Date(sub.current_period_end * 1000).toLocaleString()}`);
  console.log(`   Price: $${(sub.items.data[0].price.unit_amount || 0) / 100}/month`);
  
  // 4. Check payment method
  console.log('\n4️⃣ PAYMENT METHOD CHECK');
  if (!sub.default_payment_method) {
    console.log('❌ NO PAYMENT METHOD ON SUBSCRIPTION!');
    console.log('   → Rebilling WILL FAIL');
    return;
  }

  console.log(`✅ Payment method attached: ${sub.default_payment_method}`);
  
  // Get payment method details
  const pm = await stripe.paymentMethods.retrieve(sub.default_payment_method as string);
  console.log(`   Card: ${pm.card?.brand} ****${pm.card?.last4}`);
  console.log(`   Expires: ${pm.card?.exp_month}/${pm.card?.exp_year}`);

  // 5. Check upcoming invoice
  console.log('\n5️⃣ UPCOMING INVOICE CHECK');
  try {
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
    });
    
    console.log(`✅ Upcoming invoice scheduled`);
    console.log(`   Amount: $${upcomingInvoice.amount_due / 100}`);
    console.log(`   Due Date: ${new Date(upcomingInvoice.period_end * 1000).toLocaleString()}`);
    console.log(`   Will charge: ${pm.card?.brand} ****${pm.card?.last4}`);
  } catch (error: any) {
    if (error.code === 'invoice_upcoming_none') {
      console.log('⚠️  No upcoming invoice (may be too early in trial)');
    } else {
      console.log('⚠️  Could not retrieve upcoming invoice:', error.message);
    }
  }

  // 6. Final verdict
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL VERDICT:\n');
  
  if (sub.status === 'trialing' && sub.default_payment_method) {
    console.log('✅ ✅ ✅ READY FOR REBILLING! ✅ ✅ ✅');
    console.log('\nThis user WILL be successfully charged $39.97 when trial ends.');
    console.log(`Trial ends: ${new Date(sub.trial_end! * 1000).toLocaleString()}`);
  } else if (!sub.default_payment_method) {
    console.log('❌ ❌ ❌ NOT READY - NO PAYMENT METHOD ❌ ❌ ❌');
    console.log('\nThis user will NOT be charged when trial ends.');
    console.log('The subscription will fail and cancel.');
  } else {
    console.log('⚠️  Status unclear - review details above');
  }
  
  console.log('\n' + '='.repeat(60));
}

verifyTestUser().catch(console.error);
