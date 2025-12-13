import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get all active subscriptions from Stripe
    const activeInStripe: { customerId: string; email: string; status: string }[] = [];
    
    let hasMore = true;
    let startingAfter: string | undefined;
    
    while (hasMore) {
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        status: 'active',
        starting_after: startingAfter,
      });
      
      for (const sub of subscriptions.data) {
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        
        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email || 'unknown';
        
        activeInStripe.push({
          customerId,
          email,
          status: sub.status,
        });
      }
      
      hasMore = subscriptions.has_more;
      if (subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    // Get users from our database
    const dbUsers = await prisma.user.findMany({
      where: {
        stripeCustomerId: { not: null },
      },
      select: {
        email: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
      },
    });

    // Find mismatches
    const mismatches = [];
    
    for (const stripeSub of activeInStripe) {
      const dbUser = dbUsers.find(u => u.stripeCustomerId === stripeSub.customerId);
      
      if (!dbUser) {
        mismatches.push({
          email: stripeSub.email,
          stripeCustomerId: stripeSub.customerId,
          stripeStatus: 'active',
          dbStatus: 'NOT FOUND IN DB',
          issue: 'User not in database',
        });
      } else if (dbUser.subscriptionStatus !== 'active') {
        mismatches.push({
          email: dbUser.email,
          stripeCustomerId: stripeSub.customerId,
          stripeStatus: 'active',
          dbStatus: dbUser.subscriptionStatus,
          issue: 'Status mismatch - active in Stripe but not in DB',
        });
      }
    }

    // Also find users marked active in DB but not in Stripe
    for (const dbUser of dbUsers) {
      if (dbUser.subscriptionStatus === 'active') {
        const inStripe = activeInStripe.find(s => s.customerId === dbUser.stripeCustomerId);
        if (!inStripe) {
          mismatches.push({
            email: dbUser.email,
            stripeCustomerId: dbUser.stripeCustomerId,
            stripeStatus: 'NOT ACTIVE',
            dbStatus: 'active',
            issue: 'Status mismatch - active in DB but not in Stripe',
          });
        }
      }
    }

    return NextResponse.json({
      activeInStripe: activeInStripe.length,
      activeInDb: dbUsers.filter(u => u.subscriptionStatus === 'active').length,
      mismatches,
    });
  } catch (error) {
    console.error('[Stripe Mismatch] Error:', error);
    return NextResponse.json({ 
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
