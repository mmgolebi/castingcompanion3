import Stripe from 'stripe';

// This file is READ-ONLY - it only queries Stripe invoices
// It does NOT modify any data or interfere with webhooks

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface StripePaymentData {
  customerId: string;
  hasPaidFullPrice: boolean;  // Has paid $39.97 (not just $1 trial)
  totalPaid: number;
  paymentCount: number;
}

/**
 * Fetches all paid invoices from Stripe and builds a map of customer payment data.
 * This is used to accurately determine who has actually paid $39.97 vs just the $1 trial.
 */
export async function getStripePaymentHistory(): Promise<Map<string, StripePaymentData>> {
  const paymentMap = new Map<string, StripePaymentData>();
  
  try {
    let hasMore = true;
    let startingAfter: string | undefined;
    
    while (hasMore) {
      const invoices = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        starting_after: startingAfter,
      });
      
      for (const invoice of invoices.data) {
        if (!invoice.customer || typeof invoice.customer !== 'string') continue;
        
        const customerId = invoice.customer;
        const amountPaid = invoice.amount_paid / 100; // Convert from cents
        
        if (!paymentMap.has(customerId)) {
          paymentMap.set(customerId, {
            customerId,
            hasPaidFullPrice: false,
            totalPaid: 0,
            paymentCount: 0,
          });
        }
        
        const data = paymentMap.get(customerId)!;
        data.totalPaid += amountPaid;
        data.paymentCount++;
        
        // Check if this is the full price payment ($39.97)
        // Using $35+ threshold to account for any minor variations
        if (amountPaid >= 35) {
          data.hasPaidFullPrice = true;
        }
      }
      
      hasMore = invoices.has_more;
      if (invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[Stripe Analytics] Loaded payment data for ${paymentMap.size} customers`);
  } catch (error) {
    console.error('[Stripe Analytics] Error fetching payment history:', error);
  }
  
  return paymentMap;
}
