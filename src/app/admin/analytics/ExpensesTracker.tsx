'use client';

import { useState, useEffect } from 'react';

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category: 'infrastructure' | 'ai' | 'marketing' | 'tools' | 'other';
  url?: string;
  notes?: string;
}

interface FBAdSet {
  name: string;
  campaign: string;
  landingPage: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  registrations: number;
  trials: number;
  costPerRegistration: number | null;
  costPerTrial: number | null;
  trialConversionRate: string | null;
  ctr: string;
  isUnmapped?: boolean;
}

interface FBData {
  total: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: string;
    registrations: number;
    trials: number;
    costPerRegistration: number | null;
    costPerTrial: number | null;
  };
  campaigns: { name: string; spend: number; impressions: number; clicks: number }[];
  adsets: FBAdSet[];
  monthlySpend: { month: string; spend: number }[];
  yearlyTotal: number;
}

const initialExpenses: Expense[] = [
  { id: '1', name: 'Claude.ai Pro', amount: 100, frequency: 'monthly', category: 'ai', url: 'https://claude.ai', notes: 'Pro subscription for development assistance' },
  { id: '2', name: 'Resend', amount: 20, frequency: 'monthly', category: 'infrastructure', url: 'https://resend.com', notes: 'Email sending service' },
  { id: '3', name: 'UploadThing', amount: 20, frequency: 'monthly', category: 'infrastructure', url: 'https://uploadthing.com', notes: 'File storage for headshots and documents' },
  { id: '4', name: 'Claude API', amount: 10, frequency: 'monthly', category: 'ai', url: 'https://platform.claude.com', notes: 'API access for AI features' },
  { id: '5', name: 'Neon', amount: 25, frequency: 'monthly', category: 'infrastructure', url: 'https://neon.tech', notes: 'PostgreSQL database hosting' },
  { id: '6', name: 'Vercel', amount: 20, frequency: 'monthly', category: 'infrastructure', url: 'https://vercel.com', notes: 'Web app hosting and deployment' },
  { id: '7', name: 'GoHighLevel', amount: 97, frequency: 'monthly', category: 'marketing', url: 'https://gohighlevel.com', notes: 'CRM and email automation' },
  { id: '8', name: 'Hunter.io', amount: 61, frequency: 'yearly', category: 'tools', url: 'https://hunter.io', notes: 'Email lookup API for casting director contacts' },
];

const categoryColors: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  infrastructure: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', label: 'Infrastructure' },
  ai: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500', label: 'AI/ML' },
  marketing: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', label: 'Marketing' },
  tools: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', label: 'Tools' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', bar: 'bg-gray-500', label: 'Other' },
  ads: { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500', label: 'FB Ads' },
};

type DatePreset = 'today' | 'this_week' | 'this_month' | 'last_30d' | 'this_year' | 'custom';

const getShortCampaignName = (name: string): string => {
  if (name.includes('ABO')) return 'ABO';
  if (name.includes('CBO')) return 'CBO';
  if (name.includes('Trial')) return 'Trial';
  if (name === 'No Active Campaign') return '—';
  return name.slice(0, 15) + (name.length > 15 ? '...' : '');
};

const getDatePresetLabel = (preset: DatePreset): string => {
  switch (preset) {
    case 'today': return "today's";
    case 'this_week': return "this week's";
    case 'this_month': return "this month's";
    case 'last_30d': return "last 30 days'";
    case 'this_year': return "this year's";
    case 'custom': return "selected period's";
    default: return "current";
  }
};

export default function ExpensesTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ frequency: 'monthly', category: 'other' });
  const [fbData, setFbData] = useState<FBData | null>(null);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [expandedSection, setExpandedSection] = useState<'adsets' | 'campaigns' | null>('adsets');
  const [showFixedExpenses, setShowFixedExpenses] = useState(false);
  const [showShowBreakdown, setShowShowBreakdown] = useState(true);
  
  // Forecast assumptions (editable)
  const [rebillRate, setRebillRate] = useState(50);
  const [monthlyChurnRate, setMonthlyChurnRate] = useState(15);
  const [avgCustomerLifespan, setAvgCustomerLifespan] = useState(3);

  const getDateRange = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (datePreset) {
      case 'today':
        return { from: today, to: today };
      case 'this_week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return { from: startOfWeek.toISOString().split('T')[0], to: today };
      }
      case 'custom':
        return { from: customFrom, to: customTo };
      default:
        return { preset: datePreset };
    }
  };

  useEffect(() => {
    const fetchFbData = async () => {
      setFbLoading(true);
      try {
        const dateRange = getDateRange();
        let url = '/api/admin/fb-ads?';
        if ('preset' in dateRange) {
          url += `preset=${dateRange.preset}`;
        } else if (dateRange.from && dateRange.to) {
          url += `from=${dateRange.from}&to=${dateRange.to}`;
        } else {
          url += 'preset=this_month';
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setFbData(data);
        setFbError(null);
      } catch (err) {
        setFbError(err instanceof Error ? err.message : 'Failed to load FB data');
      } finally {
        setFbLoading(false);
      }
    };
    
    if (datePreset !== 'custom' || (customFrom && customTo)) {
      fetchFbData();
    }
  }, [datePreset, customFrom, customTo]);

  const monthlyTotal = expenses.reduce((sum, exp) => {
    return sum + (exp.frequency === 'monthly' ? exp.amount : exp.amount / 12);
  }, 0);

  const fbMonthlySpend = fbData?.total.spend || 0;
  const totalWithAds = monthlyTotal + fbMonthlySpend;

  const byCategory = expenses.reduce((acc, exp) => {
    const monthly = exp.frequency === 'monthly' ? exp.amount : exp.amount / 12;
    acc[exp.category] = (acc[exp.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  if (fbMonthlySpend > 0) byCategory['ads'] = fbMonthlySpend;

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    setExpenses([...expenses, {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: newExpense.amount,
      frequency: newExpense.frequency || 'monthly',
      category: newExpense.category || 'other',
      url: newExpense.url,
      notes: newExpense.notes,
    }]);
    setNewExpense({ frequency: 'monthly', category: 'other' });
    setShowAddForm(false);
  };

  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));

  // Calculate forecast for a given set of metrics
  const calculateForecastForMetrics = (trials: number, adSpend: number) => {
    const monthlyPrice = 39.97;
    const expectedConversions = Math.floor(trials * (rebillRate / 100));
    const churnDecimal = monthlyChurnRate / 100;
    
    const months: {
      month: number;
      label: string;
      newCustomers: number;
      churnedCustomers: number;
      activeCustomers: number;
      mrr: number;
      adSpend: number;
      fixedCosts: number;
      totalCosts: number;
      revenue: number;
      profit: number;
      cumulativeProfit: number;
    }[] = [];
    
    let activeCustomers = 0;
    let cumulativeProfit = 0;
    
    for (let i = 1; i <= 6; i++) {
      const monthLabel = new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const newCustomers = expectedConversions;
      const churnedCustomers = Math.floor(activeCustomers * churnDecimal);
      activeCustomers = activeCustomers + newCustomers - churnedCustomers;
      const mrr = activeCustomers * monthlyPrice;
      const monthAdSpend = adSpend;
      const fixedCosts = monthlyTotal;
      const totalCosts = monthAdSpend + fixedCosts;
      const monthTrialRevenue = trials * 1.00;
      const revenue = mrr + monthTrialRevenue;
      const profit = revenue - totalCosts;
      cumulativeProfit += profit;
      
      months.push({
        month: i,
        label: monthLabel,
        newCustomers,
        churnedCustomers,
        activeCustomers,
        mrr,
        adSpend: monthAdSpend,
        fixedCosts,
        totalCosts,
        revenue,
        profit,
        cumulativeProfit,
      });
    }
    
    return {
      trials,
      expectedConversions,
      trialRevenue: trials * 1.00,
      months,
      ltv: monthlyPrice * avgCustomerLifespan,
      cac: expectedConversions > 0 ? adSpend / expectedConversions : 0,
    };
  };

  // Calculate 6-month forecast for total
  const calculateForecast = () => {
    if (!fbData) return null;
    return calculateForecastForMetrics(fbData.total.trials, fbData.total.spend);
  };

  // Calculate per-show forecasts
  const calculateShowForecasts = () => {
    if (!fbData || !fbData.adsets) return [];
    
    return fbData.adsets
      .filter(adset => adset.trials > 0 || adset.spend > 0)
      .map(adset => {
        const expectedConversions = Math.floor(adset.trials * (rebillRate / 100));
        const monthlyPrice = 39.97;
        const ltv = monthlyPrice * avgCustomerLifespan;
        const cac = expectedConversions > 0 ? adset.spend / expectedConversions : 0;
        
        // Calculate 6-month projection for this show
        let activeCustomers = 0;
        let cumulativeProfit = 0;
        const churnDecimal = monthlyChurnRate / 100;
        
        for (let i = 1; i <= 6; i++) {
          const newCustomers = expectedConversions;
          const churnedCustomers = Math.floor(activeCustomers * churnDecimal);
          activeCustomers = activeCustomers + newCustomers - churnedCustomers;
          const mrr = activeCustomers * monthlyPrice;
          // Proportional fixed costs based on spend ratio
          const spendRatio = fbData.total.spend > 0 ? adset.spend / fbData.total.spend : 0;
          const proportionalFixedCosts = monthlyTotal * spendRatio;
          const totalCosts = adset.spend + proportionalFixedCosts;
          const monthTrialRevenue = adset.trials * 1.00;
          const revenue = mrr + monthTrialRevenue;
          const profit = revenue - totalCosts;
          cumulativeProfit += profit;
        }
        
        return {
          name: adset.name,
          campaign: adset.campaign,
          spend: adset.spend,
          trials: adset.trials,
          expectedConversions,
          ltv,
          cac,
          ltvCacRatio: cac > 0 ? ltv / cac : 0,
          sixMonthProfit: cumulativeProfit,
          activeCustomersIn6Mo: activeCustomers,
          roi: adset.spend > 0 ? ((cumulativeProfit / adset.spend) * 100) : 0,
        };
      })
      .sort((a, b) => b.sixMonthProfit - a.sixMonthProfit);
  };

  const forecast = calculateForecast();
  const showForecasts = calculateShowForecasts();

  const DateButton = ({ preset, label }: { preset: DatePreset; label: string }) => (
    <button
      onClick={() => setDatePreset(preset)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        datePreset === preset 
          ? 'bg-pink-600 text-white shadow-sm' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const MetricCard = ({ label, value, subtext, color = 'gray' }: { label: string; value: string | number; subtext?: string; color?: string }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</div>
      {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Summary Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-300">Total Monthly Spend</h2>
            <div className="text-4xl font-bold mt-1">${totalWithAds.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">
              ${monthlyTotal.toFixed(2)} fixed + ${fbMonthlySpend.toFixed(2)} ads
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Break-even point</div>
            <div className="text-3xl font-bold text-green-400">{Math.ceil(totalWithAds / 39.97)}</div>
            <div className="text-sm text-gray-400">customers @ $39.97/mo</div>
          </div>
        </div>
      </div>

      {/* FB Ads Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">📣 Facebook Ads</h2>
            <div className="flex flex-wrap items-center gap-2">
              <DateButton preset="today" label="Today" />
              <DateButton preset="this_week" label="This Week" />
              <DateButton preset="this_month" label="This Month" />
              <DateButton preset="last_30d" label="Last 30d" />
              <DateButton preset="this_year" label="This Year" />
              <DateButton preset="custom" label="Custom" />
            </div>
          </div>
          
          {datePreset === 'custom' && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="p-6">
          {fbError ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">{fbError}</div>
          ) : fbLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="ml-3 text-gray-500">Loading ads data...</span>
            </div>
          ) : fbData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <MetricCard label="Ad Spend" value={`$${fbData.total.spend.toFixed(2)}`} color="pink" />
                <MetricCard label="Registrations" value={fbData.total.registrations} subtext={fbData.total.costPerRegistration ? `$${fbData.total.costPerRegistration.toFixed(2)} each` : undefined} color="blue" />
                <MetricCard label="Trials" value={fbData.total.trials} subtext={fbData.total.costPerTrial ? `$${fbData.total.costPerTrial.toFixed(2)} CPT` : undefined} color="green" />
                <MetricCard 
                  label="Trial Rate" 
                  value={fbData.total.registrations > 0 ? `${((fbData.total.trials / fbData.total.registrations) * 100).toFixed(1)}%` : '—'} 
                  color="purple" 
                />
                <MetricCard label="Clicks" value={fbData.total.clicks.toLocaleString()} subtext={`${fbData.total.ctr}% CTR`} />
                <MetricCard label="Impressions" value={fbData.total.impressions.toLocaleString()} />
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'adsets' ? null : 'adsets')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Performance by Ad Set</span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'adsets' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSection === 'adsets' && fbData.adsets && fbData.adsets.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Ad Set</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Campaign</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Landing Page</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Spend</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Regs</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">CPR</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Trials</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">CPT</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600">Conv %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fbData.adsets.map((adset, i) => (
                          <tr key={i} className={`hover:bg-gray-50 transition-colors ${adset.isUnmapped ? 'bg-amber-50' : ''}`}>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{adset.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                adset.campaign.includes('ABO') ? 'bg-blue-100 text-blue-700' :
                                adset.campaign.includes('CBO') ? 'bg-purple-100 text-purple-700' :
                                adset.campaign.includes('Trial') ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {getShortCampaignName(adset.campaign)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {adset.landingPage ? (
                                <a 
                                  href={`https://castingcompanion.com${adset.landingPage}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {adset.landingPage}
                                </a>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-pink-600">
                              ${adset.spend.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-blue-600">
                              {adset.registrations}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {adset.costPerRegistration ? (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  adset.costPerRegistration < 2 ? 'bg-green-100 text-green-700' : 
                                  adset.costPerRegistration < 3 ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  ${adset.costPerRegistration.toFixed(2)}
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-green-600">
                              {adset.trials}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {adset.costPerTrial ? (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  adset.costPerTrial < 5 ? 'bg-green-100 text-green-700' : 
                                  adset.costPerTrial < 10 ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  ${adset.costPerTrial.toFixed(2)}
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {adset.trialConversionRate ? (
                                <span className={`font-semibold ${
                                  parseFloat(adset.trialConversionRate) >= 30 ? 'text-green-600' : 
                                  parseFloat(adset.trialConversionRate) >= 15 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {adset.trialConversionRate}%
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr className="font-semibold">
                          <td className="py-3 px-4 text-gray-900">Total</td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4 text-right text-pink-600">${fbData.total.spend.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-blue-600">{fbData.total.registrations}</td>
                          <td className="py-3 px-4 text-right">
                            {fbData.total.costPerRegistration ? `$${fbData.total.costPerRegistration.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">{fbData.total.trials}</td>
                          <td className="py-3 px-4 text-right">
                            {fbData.total.costPerTrial ? `$${fbData.total.costPerTrial.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {fbData.total.registrations > 0 
                              ? `${((fbData.total.trials / fbData.total.registrations) * 100).toFixed(1)}%` 
                              : '—'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Profitability Forecast Section */}
      {forecast && fbData && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
          <div className="p-6 border-b border-emerald-200">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-semibold text-emerald-900">📈 Profitability Forecast</h2>
                <p className="text-sm text-emerald-700 mt-1">
                  Based on <span className="font-semibold">{getDatePresetLabel(datePreset)}</span> ad performance
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                  <label className="block text-xs text-emerald-600 font-medium">Rebill Rate</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={rebillRate}
                      onChange={(e) => setRebillRate(Number(e.target.value))}
                      className="w-12 text-center font-semibold text-emerald-900 border-0 p-0 focus:ring-0"
                      min="0"
                      max="100"
                    />
                    <span className="text-emerald-600">%</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                  <label className="block text-xs text-emerald-600 font-medium">Monthly Churn</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={monthlyChurnRate}
                      onChange={(e) => setMonthlyChurnRate(Number(e.target.value))}
                      className="w-12 text-center font-semibold text-emerald-900 border-0 p-0 focus:ring-0"
                      min="0"
                      max="100"
                    />
                    <span className="text-emerald-600">%</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                  <label className="block text-xs text-emerald-600 font-medium">Avg Lifespan</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={avgCustomerLifespan}
                      onChange={(e) => setAvgCustomerLifespan(Number(e.target.value))}
                      className="w-12 text-center font-semibold text-emerald-900 border-0 p-0 focus:ring-0"
                      min="1"
                      max="24"
                    />
                    <span className="text-emerald-600">mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase">Trials This Period</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">{forecast.trials}</div>
                <div className="text-xs text-emerald-600 mt-1">${fbData.total.trials} × $1 = ${fbData.total.trials} revenue</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase">Expected Conversions</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">{forecast.expectedConversions}</div>
                <div className="text-xs text-emerald-600 mt-1">{rebillRate}% of {forecast.trials} trials</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase">Est. LTV</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">${forecast.ltv.toFixed(2)}</div>
                <div className="text-xs text-emerald-600 mt-1">${(39.97).toFixed(2)} × {avgCustomerLifespan} months</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 uppercase">CAC</div>
                <div className={`text-2xl font-bold mt-1 ${forecast.cac < forecast.ltv ? 'text-emerald-900' : 'text-red-600'}`}>
                  ${forecast.cac.toFixed(2)}
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  {forecast.cac < forecast.ltv ? '✓ LTV > CAC' : '⚠ CAC exceeds LTV'}
                </div>
              </div>
            </div>

            {/* Per-Show Breakdown */}
            {showForecasts.length > 0 && (
              <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden mb-6">
                <button
                  onClick={() => setShowShowBreakdown(!showShowBreakdown)}
                  className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-emerald-900">📺 Forecast by Show</h3>
                    <p className="text-xs text-emerald-600 mt-1">6-month projection per ad set</p>
                  </div>
                  <svg className={`w-5 h-5 text-emerald-600 transition-transform ${showShowBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showShowBreakdown && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-emerald-50 border-b border-emerald-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-emerald-700">Show</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">Spend</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">Trials</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">Est. Conversions</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">CAC</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">LTV:CAC</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">6-Mo Customers</th>
                          <th className="text-right py-3 px-4 font-semibold text-emerald-700">6-Mo Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {showForecasts.map((show, i) => (
                          <tr key={i} className="hover:bg-emerald-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{show.name}</div>
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                                show.campaign.includes('ABO') ? 'bg-blue-100 text-blue-700' :
                                show.campaign.includes('CBO') ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {getShortCampaignName(show.campaign)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-pink-600">
                              ${show.spend.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-blue-600">
                              {show.trials}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-emerald-600">
                              {show.expectedConversions}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {show.cac > 0 ? (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  show.cac < show.ltv / 3 ? 'bg-green-100 text-green-700' : 
                                  show.cac < show.ltv ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  ${show.cac.toFixed(2)}
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {show.ltvCacRatio > 0 ? (
                                <span className={`font-semibold ${
                                  show.ltvCacRatio >= 3 ? 'text-green-600' : 
                                  show.ltvCacRatio >= 1 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {show.ltvCacRatio.toFixed(1)}x
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">
                              {show.activeCustomersIn6Mo}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${show.sixMonthProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ${show.sixMonthProfit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-emerald-50 border-t border-emerald-200">
                        <tr className="font-semibold">
                          <td className="py-3 px-4 text-emerald-900">Total</td>
                          <td className="py-3 px-4 text-right text-pink-600">${fbData.total.spend.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-blue-600">{fbData.total.trials}</td>
                          <td className="py-3 px-4 text-right text-emerald-600">{forecast.expectedConversions}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              ${forecast.cac.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-600">
                            {(forecast.ltv / forecast.cac).toFixed(1)}x
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">{forecast.months[5]?.activeCustomers || 0}</td>
                          <td className="py-3 px-4 text-right text-emerald-700">${forecast.months[5]?.cumulativeProfit.toFixed(2) || '0.00'}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 6-Month Forecast Table */}
            <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
              <div className="p-4 bg-emerald-50 border-b border-emerald-200">
                <h3 className="font-semibold text-emerald-900">6-Month Projection (All Shows Combined)</h3>
                <p className="text-xs text-emerald-600 mt-1">Assuming similar monthly ad spend and performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-50 border-b border-emerald-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-emerald-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">New Customers</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">Churned</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">Active</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">MRR</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">Total Costs</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">Profit</th>
                      <th className="text-right py-3 px-4 font-semibold text-emerald-700">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {forecast.months.map((month) => (
                      <tr key={month.month} className="hover:bg-emerald-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{month.label}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">+{month.newCustomers}</td>
                        <td className="py-3 px-4 text-right text-red-500">-{month.churnedCustomers}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{month.activeCustomers}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-medium">${month.mrr.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-pink-600">${month.totalCosts.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.profit >= 0 ? '+' : ''}{month.profit.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${month.cumulativeProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          ${month.cumulativeProfit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="text-sm text-emerald-700">At current rates, in 6 months you&apos;ll have:</div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">
                    {forecast.months[5]?.activeCustomers || 0} active customers
                  </div>
                  <div className="text-sm text-emerald-600">
                    generating ${(forecast.months[5]?.mrr || 0).toFixed(2)}/mo MRR
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-700">6-Month Cumulative Profit:</div>
                  <div className={`text-3xl font-bold ${(forecast.months[5]?.cumulativeProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${(forecast.months[5]?.cumulativeProfit || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = (amount / totalWithAds) * 100;
                const colors = categoryColors[category] || categoryColors.other;
                return (
                  <div key={category} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`${colors.bg} ${colors.text} px-2.5 py-1 rounded-lg text-xs font-semibold`}>
                        {colors.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${amount.toFixed(2)} <span className="text-gray-400 font-normal">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">💡 Quick Stats</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">Fixed costs</span>
              <span className="font-semibold text-amber-900">${monthlyTotal.toFixed(2)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Ad spend</span>
              <span className="font-semibold text-amber-900">${fbMonthlySpend.toFixed(2)}</span>
            </div>
            <div className="border-t border-amber-200 pt-4 flex justify-between">
              <span className="text-amber-700">Break-even</span>
              <span className="font-bold text-amber-900">{Math.ceil(totalWithAds / 39.97)} customers</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Yearly fixed</span>
              <span className="font-semibold text-amber-900">${(monthlyTotal * 12).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Expenses (Collapsible) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowFixedExpenses(!showFixedExpenses)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <span className="text-lg font-semibold text-gray-900">Fixed Expenses</span>
            <span className="text-sm text-gray-500">({expenses.length} items • ${monthlyTotal.toFixed(2)}/mo)</span>
          </div>
          <svg className={`w-5 h-5 text-gray-500 transition-transform ${showFixedExpenses ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFixedExpenses && (
          <div className="border-t border-gray-100">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Add Expense
              </button>
            </div>

            {showAddForm && (
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border border-gray-200 rounded-lg px-3 py-2 md:col-span-2 text-sm"
                    value={newExpense.name || ''}
                    onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  />
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={newExpense.frequency}
                    onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value as 'monthly' | 'yearly' })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                  >
                    <option value="infrastructure">Infrastructure</option>
                    <option value="ai">AI/ML</option>
                    <option value="marketing">Marketing</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={addExpense}
                    className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {expenses.map(expense => {
                const monthly = expense.frequency === 'monthly' ? expense.amount : expense.amount / 12;
                const colors = categoryColors[expense.category] || categoryColors.other;
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`${colors.bg} ${colors.text} px-2 py-1 rounded text-xs font-medium`}>
                        {colors.label}
                      </span>
                      <div>
                        {expense.url ? (
                          <a href={expense.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {expense.name}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-900">{expense.name}</span>
                        )}
                        {expense.notes && <p className="text-xs text-gray-500">{expense.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{expense.frequency} • ${monthly.toFixed(2)}/mo</div>
                      </div>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
