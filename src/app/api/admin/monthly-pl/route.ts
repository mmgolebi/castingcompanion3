import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;

// Fixed monthly costs
const FIXED_MONTHLY_COSTS = 292 + (61/12);

// Platform launch date - only show data from this month onwards
const LAUNCH_YEAR = 2025;
const LAUNCH_MONTH = 10; // November (0-indexed)

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
            const monthKey = item.date_start.slice(0, 7);
            fbMonthlySpend[monthKey] = parseFloat(item.spend || '0');
          });
        }
      } catch (e) {
        console.error('FB API error:', e);
      }
    }

    // Determine start month based on launch date
    const startMonth = year === LAUNCH_YEAR ? LAUNCH_MONTH : 0;

    // Process each month
    for (let month = startMonth; month < 12; month++) {
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
          subscriptionStatus: true,
        },
      });

      const registrations = users.length;
      const trials = users.filter(u => u.stripeCustomerId).length;

      // Get subscription revenue estimate
      const subscriptionRevenue = await getSubscriptionRevenueForMonth(monthStart, monthEnd);

      // Calculate costs
      const adSpend = fbMonthlySpend[monthKey] || 0;
      const fixedCosts = FIXED_MONTHLY_COSTS;
      const totalCosts = adSpend + fixedCosts;

      // Calculate revenue
      const trialRevenue = trials * 1.00;
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
        activeSubscribers: 0,
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

async function getSubscriptionRevenueForMonth(start: Date, end: Date): Promise<number> {
  const trialStartCutoff = new Date(start);
  trialStartCutoff.setDate(trialStartCutoff.getDate() - 14);
  
  const potentialSubscribers = await prisma.user.count({
    where: {
      stripeCustomerId: { not: null },
      subscriptionStatus: 'active',
      createdAt: {
        gte: new Date(start.getFullYear(), start.getMonth() - 2, 1),
        lt: trialStartCutoff,
      },
    },
  });
  
  const estimatedSubscribers = Math.floor(potentialSubscribers * 0.5);
  return estimatedSubscribers * 39.97;
}
