import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  if (!FB_ACCESS_TOKEN || !FB_AD_ACCOUNT_ID) {
    return NextResponse.json({ error: 'FB credentials not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const preset = searchParams.get('preset') || 'this_month';

  try {
    // Build date params
    let dateParams = '';
    if (from && to) {
      dateParams = `time_range={"since":"${from}","until":"${to}"}`;
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

    // Get monthly spend for the year
    const yearUrl = `https://graph.facebook.com/v18.0/act_${FB_AD_ACCOUNT_ID}/insights?fields=spend&date_preset=this_year&time_increment=monthly&access_token=${FB_ACCESS_TOKEN}`;
    const yearRes = await fetch(yearUrl);
    const yearData = await yearRes.json();

    const totalSpend = accountData.data?.[0]?.spend || '0';
    const totalImpressions = accountData.data?.[0]?.impressions || '0';
    const totalClicks = accountData.data?.[0]?.clicks || '0';

    const campaigns: { name: string; spend: number; impressions: number; clicks: number }[] = campaignData.data?.map((c: FBCampaign) => ({
      name: c.campaign_name,
      spend: parseFloat(c.spend || '0'),
      impressions: parseInt(c.impressions || '0'),
      clicks: parseInt(c.clicks || '0'),
    })) || [];

    // Sort by spend descending
    campaigns.sort((a, b) => b.spend - a.spend);

    const monthlySpend = yearData.data?.map((m: FBInsight) => ({
      month: m.date_start,
      spend: parseFloat(m.spend || '0'),
    })) || [];

    const yearlyTotal = monthlySpend.reduce((sum: number, m: { spend: number }) => sum + m.spend, 0);

    return NextResponse.json({
      total: {
        spend: parseFloat(totalSpend),
        impressions: parseInt(totalImpressions),
        clicks: parseInt(totalClicks),
        ctr: totalImpressions !== '0' ? ((parseInt(totalClicks) / parseInt(totalImpressions)) * 100).toFixed(2) : '0',
      },
      campaigns,
      monthlySpend,
      yearlyTotal,
    });
  } catch (error) {
    console.error('FB API error:', error);
    return NextResponse.json({ error: 'Failed to fetch FB data' }, { status: 500 });
  }
}
