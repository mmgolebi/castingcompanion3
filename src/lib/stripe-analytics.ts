import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface StripePaymentData {
  customerId: string;
  hasPaidFullPrice: boolean;
  totalPaid: number;
  paymentCount: number;
}

export async function getStripePaymentHistory(): Promise<Map<string, StripePaymentData>> {
  const paymentMap = new Map<string, StripePaymentData>();
  
  // If no Stripe key, return empty map (graceful fallback)
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[Stripe Analytics] No STRIPE_SECRET_KEY found, skipping payment history');
    return paymentMap;
  }
  
  try {
    let hasMore = true;
    let startingAfter: string | undefined;
    let pageCount = 0;
    const maxPages = 20; // Safety limit
    
    while (hasMore && pageCount < maxPages) {
      pageCount++;
      
      const invoices = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        starting_after: startingAfter,
      });
      
      for (const invoice of invoices.data) {
        if (!invoice.customer || typeof invoice.customer !== 'string') continue;
        
        const customerId = invoice.customer;
        const amountPaid = invoice.amount_paid / 100;
        
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
    // Return empty map on error - analytics will fall back to old behavior
  }
  
  return paymentMap;
}
