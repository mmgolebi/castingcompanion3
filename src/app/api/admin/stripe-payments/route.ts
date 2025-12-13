import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CASTING_COMPANION_PRODUCT_ID = 'prod_TDrkODWf80MCWP';

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
    // Map of customerId -> payment info (only for Casting Companion)
    const paymentMap: Record<string, { hasPaidFullPrice: boolean; totalPaid: number; paymentCount: number }> = {};
    
    let hasMore = true;
    let startingAfter: string | undefined;
    let pageCount = 0;
    const maxPages = 20;
    
    while (hasMore && pageCount < maxPages) {
      pageCount++;
      
      const invoices = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        starting_after: startingAfter,
        expand: ['data.lines.data.price.product'],
      });
      
      for (const invoice of invoices.data) {
        if (!invoice.customer || typeof invoice.customer !== 'string') continue;
        
        // Check if this invoice contains Casting Companion product
        let hasCastingCompanionItem = false;
        let ccAmount = 0;
        
        for (const lineItem of invoice.lines.data) {
          const product = lineItem.price?.product;
          const productId = typeof product === 'string' ? product : product?.id;
          
          if (productId === CASTING_COMPANION_PRODUCT_ID) {
            hasCastingCompanionItem = true;
            ccAmount += (lineItem.amount || 0) / 100;
          }
        }
        
        if (!hasCastingCompanionItem) continue;
        
        const customerId = invoice.customer;
        
        if (!paymentMap[customerId]) {
          paymentMap[customerId] = {
            hasPaidFullPrice: false,
            totalPaid: 0,
            paymentCount: 0,
          };
        }
        
        paymentMap[customerId].totalPaid += ccAmount;
        paymentMap[customerId].paymentCount++;
        
        // $39.97 payment (using $35+ threshold)
        if (ccAmount >= 35) {
          paymentMap[customerId].hasPaidFullPrice = true;
        }
      }
      
      hasMore = invoices.has_more;
      if (invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    // Get users with their stripe customer IDs
    const users = await prisma.user.findMany({
      where: {
        role: 'ACTOR',
        stripeCustomerId: { not: null },
      },
      select: {
        id: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    // Calculate accurate metrics
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let paidFullPrice = 0;
    let activeAfterPaying = 0;
    let churnedAfterPaying = 0;
    let trialsEndedCount = 0;

    for (const user of users) {
      if (!user.stripeCustomerId) continue;
      
      const trialEnded = new Date(user.createdAt) < fourteenDaysAgo;
      if (trialEnded) trialsEndedCount++;

      const stripeData = paymentMap[user.stripeCustomerId];
      if (stripeData?.hasPaidFullPrice) {
        paidFullPrice++;
        if (user.subscriptionStatus === 'active') {
          activeAfterPaying++;
        } else {
          churnedAfterPaying++;
        }
      }
    }

    const rebillRate = trialsEndedCount > 0 
      ? ((paidFullPrice / trialsEndedCount) * 100).toFixed(1)
      : '0';

    const churnRate = paidFullPrice > 0
      ? ((churnedAfterPaying / paidFullPrice) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      productId: CASTING_COMPANION_PRODUCT_ID,
      metrics: {
        paidFullPrice,
        activeAfterPaying,
        churnedAfterPaying,
        trialsEnded: trialsEndedCount,
        rebillRate,
        churnRate,
      },
      customersProcessed: Object.keys(paymentMap).length,
    });
  } catch (error) {
    console.error('[Stripe Payments API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Stripe data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
