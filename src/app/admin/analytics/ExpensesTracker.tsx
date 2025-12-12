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

interface FBCampaign {
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
}

interface FBAdSet {
  name: string;
  campaign: string;
  landingPage: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  registrations: number;
  costPerRegistration: number | null;
  ctr: string;
}

interface FBData {
  total: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: string;
  };
  campaigns: FBCampaign[];
  adsets: FBAdSet[];
  monthlySpend: { month: string; spend: number }[];
  yearlyTotal: number;
}

// Initial expenses data
const initialExpenses: Expense[] = [
  {
    id: '1',
    name: 'Claude.ai Pro',
    amount: 100,
    frequency: 'monthly',
    category: 'ai',
    url: 'https://claude.ai',
    notes: 'Pro subscription for development assistance'
  },
  {
    id: '2',
    name: 'Resend',
    amount: 20,
    frequency: 'monthly',
    category: 'infrastructure',
    url: 'https://resend.com',
    notes: 'Email sending service'
  },
  {
    id: '3',
    name: 'UploadThing',
    amount: 20,
    frequency: 'monthly',
    category: 'infrastructure',
    url: 'https://uploadthing.com',
    notes: 'File storage for headshots and documents'
  },
  {
    id: '4',
    name: 'Claude API',
    amount: 10,
    frequency: 'monthly',
    category: 'ai',
    url: 'https://platform.claude.com',
    notes: 'API access for AI features'
  },
  {
    id: '5',
    name: 'Neon',
    amount: 25,
    frequency: 'monthly',
    category: 'infrastructure',
    url: 'https://neon.tech',
    notes: 'PostgreSQL database hosting'
  },
  {
    id: '6',
    name: 'Vercel',
    amount: 20,
    frequency: 'monthly',
    category: 'infrastructure',
    url: 'https://vercel.com',
    notes: 'Web app hosting and deployment'
  },
  {
    id: '7',
    name: 'GoHighLevel',
    amount: 97,
    frequency: 'monthly',
    category: 'marketing',
    url: 'https://gohighlevel.com',
    notes: 'CRM and email automation'
  },
  {
    id: '8',
    name: 'Hunter.io',
    amount: 61,
    frequency: 'yearly',
    category: 'tools',
    url: 'https://hunter.io',
    notes: 'Email lookup API for casting director contacts'
  },
];

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  infrastructure: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Infrastructure' },
  ai: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'AI/ML' },
  marketing: { bg: 'bg-green-100', text: 'text-green-800', label: 'Marketing' },
  tools: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Tools' },
  other: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Other' },
  ads: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'FB Ads' },
};

export default function ExpensesTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    frequency: 'monthly',
    category: 'other',
  });
  const [fbData, setFbData] = useState<FBData | null>(null);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbDateRange, setFbDateRange] = useState<'this_month' | 'last_30d' | 'this_year'>('this_month');
  const [showAdSets, setShowAdSets] = useState(true);

  // Fetch FB ads data
  useEffect(() => {
    const fetchFbData = async () => {
      setFbLoading(true);
      try {
        const res = await fetch(`/api/admin/fb-ads?preset=${fbDateRange}`);
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
    fetchFbData();
  }, [fbDateRange]);

  // Calculate totals (excluding FB ads - those are variable)
  const monthlyTotal = expenses.reduce((sum, exp) => {
    if (exp.frequency === 'monthly') return sum + exp.amount;
    return sum + (exp.amount / 12);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Total including FB ads this month
  const fbMonthlySpend = fbData?.total.spend || 0;
  const totalWithAds = monthlyTotal + fbMonthlySpend;

  // Group by category
  const byCategory = expenses.reduce((acc, exp) => {
    const monthly = exp.frequency === 'monthly' ? exp.amount : exp.amount / 12;
    acc[exp.category] = (acc[exp.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  // Add FB ads to category breakdown
  if (fbMonthlySpend > 0) {
    byCategory['ads'] = fbMonthlySpend;
  }

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    
    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: newExpense.amount,
      frequency: newExpense.frequency || 'monthly',
      category: newExpense.category || 'other',
      url: newExpense.url,
      notes: newExpense.notes,
    };
    
    setExpenses([...expenses, expense]);
    setNewExpense({ frequency: 'monthly', category: 'other' });
    setShowAddForm(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Fixed Monthly</h3>
          <p className="text-3xl font-bold text-gray-900">${monthlyTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">recurring costs</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">FB Ads (This Month)</h3>
          <p className="text-3xl font-bold text-pink-600">
            {fbLoading ? '...' : `$${fbMonthlySpend.toFixed(2)}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {fbData ? `${fbData.total.impressions.toLocaleString()} impressions` : 'variable'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total This Month</h3>
          <p className="text-3xl font-bold text-red-600">${totalWithAds.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">fixed + ads</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Break-even</h3>
          <p className="text-3xl font-bold text-green-600">{Math.ceil(totalWithAds / 39.97)}</p>
          <p className="text-sm text-gray-500 mt-1">customers @ $39.97/mo</p>
        </div>
      </div>

      {/* FB Ads Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-pink-900">📣 Facebook Ads</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFbDateRange('this_month')}
              className={`px-3 py-1 rounded text-sm ${fbDateRange === 'this_month' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setFbDateRange('last_30d')}
              className={`px-3 py-1 rounded text-sm ${fbDateRange === 'last_30d' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setFbDateRange('this_year')}
              className={`px-3 py-1 rounded text-sm ${fbDateRange === 'this_year' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700'}`}
            >
              This Year
            </button>
          </div>
        </div>

        {fbError ? (
          <div className="text-red-600 bg-red-50 p-4 rounded">{fbError}</div>
        ) : fbLoading ? (
          <div className="text-gray-500 animate-pulse">Loading Facebook Ads data...</div>
        ) : fbData ? (
          <div className="space-y-4">
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded p-4">
                <div className="text-xs font-medium text-gray-500">Total Spend</div>
                <div className="text-2xl font-bold text-pink-600">${fbData.total.spend.toFixed(2)}</div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-medium text-gray-500">Impressions</div>
                <div className="text-2xl font-bold">{fbData.total.impressions.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-medium text-gray-500">Clicks</div>
                <div className="text-2xl font-bold">{fbData.total.clicks.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-medium text-gray-500">CTR</div>
                <div className="text-2xl font-bold">{fbData.total.ctr}%</div>
              </div>
            </div>

            {/* Toggle between Campaign and Ad Set view */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setShowAdSets(false)}
                className={`px-3 py-1 rounded text-sm ${!showAdSets ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
              >
                By Campaign
              </button>
              <button
                onClick={() => setShowAdSets(true)}
                className={`px-3 py-1 rounded text-sm ${showAdSets ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
              >
                By Ad Set (Landing Page)
              </button>
            </div>

            {/* Ad Set Breakdown */}
            {showAdSets && fbData.adsets && fbData.adsets.length > 0 && (
              <div className="bg-white rounded p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Ad Set Performance by Landing Page</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Ad Set</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Landing Page</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">Spend</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">Impr.</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">Clicks</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">CTR</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">Regs</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fbData.adsets.map((adset, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{adset.name}</td>
                          <td className="py-2 px-2">
                            {adset.landingPage ? (
                              <a 
                                href={`https://castingcompanion.com${adset.landingPage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {adset.landingPage}
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-pink-600">
                            ${adset.spend.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-600">
                            {adset.impressions.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-600">
                            {adset.clicks.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-600">
                            {adset.ctr}%
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-green-600">
                            {adset.registrations}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {adset.costPerRegistration ? (
                              <span className={`font-semibold ${adset.costPerRegistration < 2 ? 'text-green-600' : adset.costPerRegistration < 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                                ${adset.costPerRegistration.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="py-2 px-2 font-bold" colSpan={2}>Total</td>
                        <td className="py-2 px-2 text-right font-bold text-pink-600">
                          ${fbData.total.spend.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {fbData.total.impressions.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {fbData.total.clicks.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {fbData.total.ctr}%
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-green-600">
                          {fbData.adsets.reduce((sum, a) => sum + a.registrations, 0)}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {fbData.adsets.reduce((sum, a) => sum + a.registrations, 0) > 0 
                            ? `$${(fbData.total.spend / fbData.adsets.reduce((sum, a) => sum + a.registrations, 0)).toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Campaign Breakdown */}
            {!showAdSets && fbData.campaigns.length > 0 && (
              <div className="bg-white rounded p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Campaign Breakdown</h3>
                <div className="space-y-2">
                  {fbData.campaigns.map((campaign, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate max-w-xs">{campaign.name}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.impressions.toLocaleString()} impr • {campaign.clicks.toLocaleString()} clicks
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pink-600">${campaign.spend.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {fbData.total.spend > 0 ? ((campaign.spend / fbData.total.spend) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yearly Total */}
            {fbDateRange === 'this_year' && (
              <div className="bg-white rounded p-4">
                <div className="text-sm text-gray-600">
                  <strong>Year to Date:</strong> ${fbData.yearlyTotal.toFixed(2)} spent on Facebook Ads
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Expenses by Category</h2>
        <div className="space-y-3">
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
              const percentage = (amount / totalWithAds) * 100;
              const colors = categoryColors[category] || categoryColors.other;
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-32">
                    <span className={`${colors.bg} ${colors.text} px-2 py-1 rounded text-xs font-medium`}>
                      {colors.label}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.bg.replace('100', '500')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Fixed Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">💰 Fixed Expenses</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Expense
          </button>
        </div>

        {showAddForm && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Name"
                className="border rounded-lg px-3 py-2 md:col-span-2"
                value={newExpense.name || ''}
                onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount"
                className="border rounded-lg px-3 py-2"
                value={newExpense.amount || ''}
                onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={newExpense.frequency}
                onChange={e => setNewExpense({ ...newExpense, frequency: e.target.value as 'monthly' | 'yearly' })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select
                className="border rounded-lg px-3 py-2"
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
                className="bg-green-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="url"
                placeholder="URL (optional)"
                className="border rounded-lg px-3 py-2"
                value={newExpense.url || ''}
                onChange={e => setNewExpense({ ...newExpense, url: e.target.value })}
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                className="border rounded-lg px-3 py-2"
                value={newExpense.notes || ''}
                onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Service</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Frequency</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Monthly</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => {
                const monthly = expense.frequency === 'monthly' 
                  ? expense.amount 
                  : expense.amount / 12;
                const colors = categoryColors[expense.category] || categoryColors.other;
                
                return (
                  <tr key={expense.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        {expense.url ? (
                          <a 
                            href={expense.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {expense.name}
                          </a>
                        ) : (
                          <span className="font-medium">{expense.name}</span>
                        )}
                        {expense.notes && (
                          <p className="text-sm text-gray-500">{expense.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        expense.frequency === 'monthly' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {expense.frequency}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">
                      ${monthly.toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`${colors.bg} ${colors.text} px-2 py-1 rounded text-xs font-medium`}>
                        {colors.label}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td className="py-3 px-4 font-bold">Fixed Total</td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4 font-bold text-green-600">
                  ${monthlyTotal.toFixed(2)}/mo
                </td>
                <td className="text-center py-3 px-4">-</td>
                <td className="text-center py-3 px-4">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Profitability Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800 text-sm">
          💡 <strong>Note:</strong> You need at least <strong>{Math.ceil(totalWithAds / 39.97)} paying customers</strong> at $39.97/mo 
          to cover your total monthly spend of ${totalWithAds.toFixed(2)} (${monthlyTotal.toFixed(2)} fixed + ${fbMonthlySpend.toFixed(2)} ads). 
          Each customer beyond that is profit!
        </p>
      </div>
    </div>
  );
}
