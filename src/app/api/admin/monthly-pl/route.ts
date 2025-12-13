import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;

// Fixed monthly costs (same as ExpensesTracker)
const FIXED_MONTHLY_COSTS = 292 + (61/12); // $292 + Hunter.io yearly

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  try {
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
            const monthKey = item.date_start.slice(0, 7); // YYYY-MM
            fbMonthlySpend[monthKey] = parseFloat(item.spend || '0');
          });
        }
      } catch (e) {
        console.error('FB API error:', e);
      }
    }

    // Process each month
    for (let month = 0; month < 12; month++) {
      // Skip future months
      if (year > currentYear || (year === currentYear && month > currentMonth)) {
        continue;
      }

      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Get registrations and trials for this month
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          stripeCustomerId: true,
        },
      });

      const registrations = users.length;
      const trials = users.filter(u => u.stripeCustomerId).length;

      // Get subscription revenue (users who have rebilled - simplified estimate)
      // In reality, you'd want to track actual Stripe payments
      const subscriptionRevenue = await getSubscriptionRevenueForMonth(monthStart, monthEnd);

      // Calculate costs
      const adSpend = fbMonthlySpend[monthKey] || 0;
      const fixedCosts = FIXED_MONTHLY_COSTS;
      const totalCosts = adSpend + fixedCosts;

      // Calculate revenue
      const trialRevenue = trials * 1.00; // $1 per trial
      const totalRevenue = trialRevenue + subscriptionRevenue;

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
        trials,
        activeSubscribers: 0, // Would need Stripe data
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
      trials: acc.trials + m.trials,
    }), {
      adSpend: 0,
      fixedCosts: 0,
      totalCosts: 0,
      totalRevenue: 0,
      profit: 0,
      registrations: 0,
      trials: 0,
    });

    return NextResponse.json({ months, totals });
  } catch (error) {
    console.error('Monthly P&L error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Helper function to estimate subscription revenue
// In production, you'd want to integrate with Stripe API
async function getSubscriptionRevenueForMonth(start: Date, end: Date): Promise<number> {
  // Get users who started trial before this month and might have converted
  // This is a simplified estimate - ideally you'd track actual Stripe payments
  
  const trialStartCutoff = new Date(start);
  trialStartCutoff.setDate(trialStartCutoff.getDate() - 14); // 14-day trial period
  
  const potentialSubscribers = await prisma.user.count({
    where: {
      stripeCustomerId: { not: null },
      createdAt: {
        gte: new Date(start.getFullYear(), start.getMonth() - 2, 1), // Started 1-2 months ago
        lt: trialStartCutoff,
      },
      // Ideally check subscription status here
    },
  });
  
  // Estimate 50% rebill rate and $39.97/month
  const estimatedSubscribers = Math.floor(potentialSubscribers * 0.5);
  return estimatedSubscribers * 39.97;
}
