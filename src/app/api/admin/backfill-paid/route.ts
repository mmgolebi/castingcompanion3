import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CASTING_COMPANION_PRODUCT_ID = 'prod_TDrkODWf80MCWP';

export async function POST() {
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
    // Cache price -> product mapping
    const priceProductCache: Record<string, string> = {};
    
    // Track customers who paid full price and when
    const paidCustomers: Record<string, Date> = {};
    
    let hasMore = true;
    let startingAfter: string | undefined;
    let pageCount = 0;
    
    while (hasMore && pageCount < 30) {
      pageCount++;
      const invoices = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        starting_after: startingAfter,
      });
      
      for (const invoice of invoices.data) {
        if (!invoice.customer || typeof invoice.customer !== 'string') continue;
        
        const amountPaid = (invoice.amount_paid || 0) / 100;
        if (amountPaid < 35) continue; // Skip $1 trials
        
        // Check if for Casting Companion
        let isCastingCompanion = false;
        for (const lineItem of invoice.lines.data) {
          if (!lineItem.price?.id) continue;
          
          let productId = priceProductCache[lineItem.price.id];
          if (!productId) {
            try {
              const price = await stripe.prices.retrieve(lineItem.price.id);
              productId = typeof price.product === 'string' ? price.product : price.product.id;
              priceProductCache[lineItem.price.id] = productId;
            } catch {
              continue;
            }
          }
          
          if (productId === CASTING_COMPANION_PRODUCT_ID) {
            isCastingCompanion = true;
            break;
          }
        }
        
        if (isCastingCompanion && invoice.status_transitions?.paid_at) {
          const customerId = invoice.customer;
          const paidAt = new Date(invoice.status_transitions.paid_at * 1000);
          
          // Keep the earliest payment date
          if (!paidCustomers[customerId] || paidAt < paidCustomers[customerId]) {
            paidCustomers[customerId] = paidAt;
          }
        }
      }
      
      hasMore = invoices.has_more;
      if (invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    // Update users in database
    let updated = 0;
    let skipped = 0;
    
    for (const [customerId, paidAt] of Object.entries(paidCustomers)) {
      const result = await prisma.user.updateMany({
        where: { 
          stripeCustomerId: customerId,
          paidFullPriceAt: null, // Only update if not already set
        },
        data: {
          paidFullPriceAt: paidAt,
        },
      });
      
      if (result.count > 0) {
        updated++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      customersFound: Object.keys(paidCustomers).length,
      updated,
      skipped,
    });
  } catch (error) {
    console.error('[Backfill] Error:', error);
    return NextResponse.json({ 
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
