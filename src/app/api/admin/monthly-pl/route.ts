import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;

const FIXED_MONTHLY_COSTS = 292 + (61/12);
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

      // Get all users created this month (new registrations)
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
      
      // New trials this month (users who started a trial this month)
      const newTrials = newUsers.filter(u => u.stripeCustomerId).length;

      // Get users who converted to paying this month
      // These are users with active status who were created before or during this month
      // and whose trial would have ended this month (created ~14 days before month end)
      const trialEndCutoff = new Date(monthStart);
      trialEndCutoff.setDate(trialEndCutoff.getDate() - 14);
      
      const convertedUsers = await prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          stripeCustomerId: { not: null },
          createdAt: {
            gte: new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1), // Started last month or earlier
            lte: trialEndCutoff, // Trial ended before this month
          },
        },
      });

      // Active subscribers at end of month
      // Count all users with active subscription status created before month end
      const activeSubscribers = await prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          createdAt: {
            lte: monthEnd,
          },
        },
      });

      // Calculate costs
      const adSpend = fbMonthlySpend[monthKey] || 0;
      const fixedCosts = FIXED_MONTHLY_COSTS;
      const totalCosts = adSpend + fixedCosts;

      // Calculate revenue
      const trialRevenue = newTrials * 1.00; // $1 per new trial
      const subscriptionRevenue = activeSubscribers * 39.97; // MRR from active subscribers
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
        newTrials,
        conversions: convertedUsers,
        activeSubscribers,
        conversionRate: newTrials > 0 ? ((convertedUsers / newTrials) * 100).toFixed(1) : '0',
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

    // Get current active subscribers for the "current" total
    const currentActiveSubscribers = await prisma.user.count({
      where: {
        subscriptionStatus: 'active',
      },
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
