import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID;

interface FBInsight {
  spend: string;
  impressions: string;
  clicks: string;
  date_start: string;
  date_stop: string;
}

interface FBCampaign {
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
}

interface FBAdSet {
  adset_name: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: { action_type: string; value: string }[];
}

// Map ad set names to source values in database
const adSetToSource: Record<string, string> = {
  'Chad Powers S2': 'chad-powers',
  'Euphoria': 'apply',
  'The Bear S5': 'the-bear',
  'Tulsa King S2': 'tulsa-king',
  'Hunting Wives S2': 'hunting-wives',
  'Tis So Sweet': 'tyler-perry',
  'Chicago Fire': 'chicago-fire',
};

// Map source values to landing page URLs for display
const sourceToLandingPage: Record<string, string> = {
  'chad-powers': '/apply-chad-powers',
  'apply': '/apply',
  'the-bear': '/apply-the-bear',
  'tulsa-king': '/apply-tulsa-king',
  'hunting-wives': '/apply-hunting-wives',
  
  'chicago-fire': '/apply-chicago-fire',
  'tyler-perry': '/apply-tyler-perry',
  'direct': '(direct)',
};

export async function GET(request: NextRequest) {
  if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
    return NextResponse.json({ error: 'FB credentials not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const preset = searchParams.get('preset') || 'this_month';

  try {
    // Calculate date range for database query
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      if (preset === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (preset === 'this_week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
      } else if (preset === 'this_month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (preset === 'last_30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (preset === 'this_year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Build date params for FB API
    let dateParams = '';
    if (from && to) {
      dateParams = `time_range={"since":"${from}","until":"${to}"}`;
    } else if (preset === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateParams = `time_range={"since":"${today}","until":"${today}"}`;
    } else if (preset === 'this_week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      dateParams = `time_range={"since":"${startOfWeek.toISOString().split('T')[0]}","until":"${now.toISOString().split('T')[0]}"}`;
    } else {
      dateParams = `date_preset=${preset}`;
    }

    // Get account-level insights
    const accountUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=spend,impressions,clicks&${dateParams}&access_token=${FB_ACCESS_TOKEN}`;
    const accountRes = await fetch(accountUrl);
    const accountData = await accountRes.json();

    if (accountData.error) {
      return NextResponse.json({ error: accountData.error.message }, { status: 400 });
    }

    // Get campaign breakdown
    const campaignUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=campaign_name,spend,impressions,clicks&level=campaign&${dateParams}&access_token=${FB_ACCESS_TOKEN}`;
    const campaignRes = await fetch(campaignUrl);
    const campaignData = await campaignRes.json();

    // Get ad set breakdown
    const adsetUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=adset_name,campaign_name,spend,impressions,clicks,actions&level=adset&${dateParams}&access_token=${FB_ACCESS_TOKEN}`;
    const adsetRes = await fetch(adsetUrl);
    const adsetData = await adsetRes.json();

    // Get monthly spend for the year
    const yearUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=spend&date_preset=this_year&time_increment=monthly&access_token=${FB_ACCESS_TOKEN}`;
    const yearRes = await fetch(yearUrl);
    const yearData = await yearRes.json();

    // Fetch ALL users from database for the time period, grouped by source
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        source: true,
        stripeCustomerId: true,
      },
    });

    // Group users by source
    const usersBySource: Record<string, { registrations: number; trials: number }> = {};
    
    users.forEach(user => {
      const source = user.source || 'direct';
      if (!usersBySource[source]) {
        usersBySource[source] = { registrations: 0, trials: 0 };
      }
      usersBySource[source].registrations++;
      if (user.stripeCustomerId) {
        usersBySource[source].trials++;
      }
    });

    const totalSpend = accountData.data?.[0]?.spend || '0';
    const totalImpressions = accountData.data?.[0]?.impressions || '0';
    const totalClicks = accountData.data?.[0]?.clicks || '0';

    const campaigns: { name: string; spend: number; impressions: number; clicks: number }[] = campaignData.data?.map((c: FBCampaign) => ({
      name: c.campaign_name,
      spend: parseFloat(c.spend || '0'),
      impressions: parseInt(c.impressions || '0'),
      clicks: parseInt(c.clicks || '0'),
    })) || [];

    // Create a set of sources that have FB ad sets
    const mappedSources = new Set(Object.values(adSetToSource));

    // Process FB ad sets
    const adsets = adsetData.data?.map((a: FBAdSet) => {
      const spend = parseFloat(a.spend || '0');
      const source = adSetToSource[a.adset_name];
      const sourceData = source ? usersBySource[source] : null;
      
      const registrations = sourceData?.registrations || 0;
      const trials = sourceData?.trials || 0;
      
      return {
        name: a.adset_name,
        campaign: a.campaign_name,
        source: source || null,
        landingPage: source ? sourceToLandingPage[source] : null,
        spend,
        impressions: parseInt(a.impressions || '0'),
        clicks: parseInt(a.clicks || '0'),
        registrations,
        trials,
        costPerRegistration: registrations > 0 ? spend / registrations : null,
        costPerTrial: trials > 0 ? spend / trials : null,
        trialConversionRate: registrations > 0 ? ((trials / registrations) * 100).toFixed(1) : null,
        ctr: parseInt(a.impressions || '0') > 0 
          ? ((parseInt(a.clicks || '0') / parseInt(a.impressions || '0')) * 100).toFixed(2)
          : '0',
      };
    }) || [];

    // Add unmapped sources (like tyler-perry, direct) as separate entries
    const unmappedSources = Object.entries(usersBySource)
      .filter(([source]) => !mappedSources.has(source))
      .map(([source, data]) => ({
        name: source === 'direct' ? '(Direct / No Source)' : source,
        campaign: 'No Active Campaign',
        source,
        landingPage: sourceToLandingPage[source] || null,
        spend: 0,
        impressions: 0,
        clicks: 0,
        registrations: data.registrations,
        trials: data.trials,
        costPerRegistration: null,
        costPerTrial: null,
        trialConversionRate: data.registrations > 0 ? ((data.trials / data.registrations) * 100).toFixed(1) : null,
        ctr: '0',
        isUnmapped: true,
      }));

    // Combine and sort
    const allAdsets = [...adsets, ...unmappedSources];
    allAdsets.sort((a, b) => b.spend - a.spend || b.registrations - a.registrations);

    campaigns.sort((a, b) => b.spend - a.spend);

    const monthlySpend = yearData.data?.map((m: FBInsight) => ({
      month: m.date_start,
      spend: parseFloat(m.spend || '0'),
    })) || [];

    const yearlyTotal = monthlySpend.reduce((sum: number, m: { spend: number }) => sum + m.spend, 0);

    // Calculate totals from DB
    const totalRegistrations = users.length;
    const totalTrials = users.filter(u => u.stripeCustomerId).length;

    return NextResponse.json({
      total: {
        spend: parseFloat(totalSpend),
        impressions: parseInt(totalImpressions),
        clicks: parseInt(totalClicks),
        ctr: totalImpressions !== '0' ? ((parseInt(totalClicks) / parseInt(totalImpressions)) * 100).toFixed(2) : '0',
        registrations: totalRegistrations,
        trials: totalTrials,
        costPerRegistration: totalRegistrations > 0 ? parseFloat(totalSpend) / totalRegistrations : null,
        costPerTrial: totalTrials > 0 ? parseFloat(totalSpend) / totalTrials : null,
      },
      campaigns,
      adsets: allAdsets,
      monthlySpend,
      yearlyTotal,
      debug: { usersBySource, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    });
  } catch (error) {
    console.error('FB API error:', error);
    return NextResponse.json({ error: 'Failed to fetch FB data' }, { status: 500 });
  }
}
