import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;
const CASTING_COMPANION_PRODUCT_ID = 'prod_TDrkODWf80MCWP';

const FIXED_MONTHLY_COSTS = 292 + (61/12);
const LAUNCH_YEAR = 2025;
const LAUNCH_MONTH = 10; // November (0-indexed)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  try {
    // Cache price -> product mapping
    const priceProductCache: Record<string, string> = {};
    
    // Get all paid invoices from Stripe for Casting Companion
    const monthlyStripeRevenue: Record<string, number> = {};
    const monthlyPaidCustomers: Record<string, Set<string>> = {};
    
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
        if (!invoice.status_transitions?.paid_at) continue;
        
        const paidDate = new Date(invoice.status_transitions.paid_at * 1000);
        if (paidDate.getFullYear() !== year) continue;
        
        // Check if invoice is for Casting Companion
        let ccAmount = 0;
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
            ccAmount += (lineItem.amount || 0) / 100;
          }
        }
        
        if (ccAmount > 0) {
          const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
          monthlyStripeRevenue[monthKey] = (monthlyStripeRevenue[monthKey] || 0) + ccAmount;
          
          if (!monthlyPaidCustomers[monthKey]) {
            monthlyPaidCustomers[monthKey] = new Set();
          }
          
          // Only count as "converted" if this was a $39.97+ payment (not just $1 trial)
          if (ccAmount >= 35) {
            monthlyPaidCustomers[monthKey].add(invoice.customer);
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

    // Get current active subscribers from Stripe (Casting Companion only)
    let currentActiveSubscribers = 0;
    hasMore = true;
    startingAfter = undefined;
    
    while (hasMore) {
      const subscriptions: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        limit: 100,
        status: 'active',
        starting_after: startingAfter,
      });
      
      for (const sub of subscriptions.data) {
        for (const item of sub.items.data) {
          let productId = priceProductCache[item.price.id];
          if (!productId) {
            try {
              const price = await stripe.prices.retrieve(item.price.id);
              productId = typeof price.product === 'string' ? price.product : price.product.id;
              priceProductCache[item.price.id] = productId;
            } catch {
              continue;
            }
          }
          
          if (productId === CASTING_COMPANION_PRODUCT_ID) {
            currentActiveSubscribers++;
            break;
          }
        }
      }
      
      hasMore = subscriptions.has_more;
      if (subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Get FB ads monthly spend for the year
    let fbMonthlySpend: Record<string, number> = {};
    
    if (FB_ACCESS_TOKEN && FB_AD_ACCOUNT_ID) {
      try {
        const fbUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=spend&time_range={"since":"${year}-01-01","until":"${year}-12-31"}&time_increment=monthly&access_token=${FB_ACCESS_TOKEN}`;
        const fbRes = await fetch(fbUrl);
        const fbData = await fbRes.json();
        
        if (fbData.data) {
          fbData.data.forEach((item: { date_start: string; spend: string }) => {
            const monthKey = item.date_start.slice(0, 7);
            fbMonthlySpend[monthKey] = parseFloat(item.spend || '0');
          });
        }
      } catch (e) {
        console.error('FB API error:', e);
      }
    }

    const startMonth = year === LAUNCH_YEAR ? LAUNCH_MONTH : 0;

    // Process each month
    for (let month = startMonth; month < 12; month++) {
      if (year > currentYear || (year === currentYear && month > currentMonth)) {
        continue;
      }

      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Get all users created this month (new registrations) from DB
      const newUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          role: 'ACTOR',
        },
        select: {
          id: true,
          stripeCustomerId: true,
          subscriptionStatus: true,
        },
      });

      const registrations = newUsers.length;
      const newTrials = newUsers.filter(u => u.stripeCustomerId).length;

      // Get conversions from Stripe data
      const conversions = monthlyPaidCustomers[monthKey]?.size || 0;

      // Calculate costs
      const adSpend = fbMonthlySpend[monthKey] || 0;
      const fixedCosts = FIXED_MONTHLY_COSTS;
      const totalCosts = adSpend + fixedCosts;

      // Revenue from Stripe (actual payments received this month)
      const totalRevenue = monthlyStripeRevenue[monthKey] || 0;
      
      // Estimate trial vs subscription revenue
      const trialRevenue = newTrials * 1.00;
      const subscriptionRevenue = Math.max(0, totalRevenue - trialRevenue);

      // Calculate profit
      const profit = totalRevenue - totalCosts;

      months.push({
        month: monthKey,
        label: monthLabel,
        adSpend,
        fixedCosts,
        totalCosts,
        trialRevenue,
        subscriptionRevenue,
        totalRevenue,
        profit,
        registrations,
        newTrials,
        conversions,
        activeSubscribers: currentActiveSubscribers, // Current active (not historical)
        conversionRate: newTrials > 0 ? ((conversions / newTrials) * 100).toFixed(1) : '0',
      });
    }

    // Calculate totals
    const totals = months.reduce((acc, m) => ({
      adSpend: acc.adSpend + m.adSpend,
      fixedCosts: acc.fixedCosts + m.fixedCosts,
      totalCosts: acc.totalCosts + m.totalCosts,
      totalRevenue: acc.totalRevenue + m.totalRevenue,
      profit: acc.profit + m.profit,
      registrations: acc.registrations + m.registrations,
      newTrials: acc.newTrials + m.newTrials,
      conversions: acc.conversions + m.conversions,
    }), {
      adSpend: 0,
      fixedCosts: 0,
      totalCosts: 0,
      totalRevenue: 0,
      profit: 0,
      registrations: 0,
      newTrials: 0,
      conversions: 0,
    });

    return NextResponse.json({ 
      months, 
      totals: {
        ...totals,
        currentActiveSubscribers,
      },
    });
  } catch (error) {
    console.error('Monthly P&L error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
