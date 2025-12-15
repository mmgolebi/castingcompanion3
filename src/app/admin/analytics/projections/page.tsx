'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StripeMetrics {
  paidFullPrice: number;
  activeAfterPaying: number;
  churnedAfterPaying: number;
  trialsEnded: number;
  rebillRate: string;
  churnRate: string;
}

export default function ProjectionsPage() {
  const [stripeMetrics, setStripeMetrics] = useState<StripeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Ad Spend & Acquisition
  const [dailyAdSpend, setDailyAdSpend] = useState(1600);
  const [costPerRegistration, setCostPerRegistration] = useState(1);

  // Conversion Rates
  const [regToTrialRate, setRegToTrialRate] = useState(5);
  const [trialToPaidRate, setTrialToPaidRate] = useState(59.7);
  const [monthlyChurnRate, setMonthlyChurnRate] = useState(58.1);
  const [avgRetention, setAvgRetention] = useState(1.7);

  // Pricing
  const [trialPrice, setTrialPrice] = useState(1);
  const [monthlyPrice, setMonthlyPrice] = useState(39.97);

  // Fetch current metrics from Stripe
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/stripe-payments');
        const data = await res.json();
        if (data.metrics) {
          setStripeMetrics(data.metrics);
          // Update with real data
          setTrialToPaidRate(parseFloat(data.metrics.rebillRate) || 59.7);
          setMonthlyChurnRate(parseFloat(data.metrics.churnRate) || 58.1);
          if (parseFloat(data.metrics.churnRate) > 0) {
            setAvgRetention(parseFloat((100 / parseFloat(data.metrics.churnRate)).toFixed(1)));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Link churn and retention
  useEffect(() => {
    if (monthlyChurnRate > 0) {
      setAvgRetention(parseFloat((100 / monthlyChurnRate).toFixed(1)));
    }
  }, [monthlyChurnRate]);

  // Calculations
  const dailyRegistrations = dailyAdSpend / costPerRegistration;
  const dailyTrials = dailyRegistrations * (regToTrialRate / 100);
  const dailyNewCustomers = dailyTrials * (trialToPaidRate / 100);

  const monthlyRegistrations = dailyRegistrations * 30;
  const monthlyTrials = dailyTrials * 30;
  const monthlyNewCustomers = dailyNewCustomers * 30;
  const monthlyAdSpendTotal = dailyAdSpend * 30;

  // Unit Economics
  const costPerTrial = dailyTrials > 0 ? dailyAdSpend / dailyTrials : 0;
  const costPerCustomer = dailyNewCustomers > 0 ? dailyAdSpend / dailyNewCustomers : 0;
  const ltv = monthlyPrice * avgRetention;
  const netLtv = ltv - costPerCustomer;
  const roi = costPerCustomer > 0 ? ((ltv - costPerCustomer) / costPerCustomer * 100) : 0;

  // 12-Month Projection
  const months = [];
  let totalCustomers = 0;
  let cumulativeProfit = 0;
  let totalNewCustomers = 0;
  let totalChurned = 0;

  for (let i = 1; i <= 12; i++) {
    const newCustomers = Math.round(monthlyNewCustomers);
    const churned = Math.round(totalCustomers * (monthlyChurnRate / 100));
    totalCustomers = totalCustomers + newCustomers - churned;
    if (totalCustomers < 0) totalCustomers = 0;

    const mrr = totalCustomers * monthlyPrice;
    const trialRevenue = monthlyTrials * trialPrice;
    const revenue = mrr + trialRevenue;
    const adSpend = monthlyAdSpendTotal;
    const profit = revenue - adSpend;
    cumulativeProfit += profit;
    totalNewCustomers += newCustomers;
    totalChurned += churned;

    months.push({
      month: i,
      newCustomers,
      churned,
      totalCustomers,
      mrr,
      adSpend,
      profit,
      cumulativeProfit,
    });
  }

  const finalMonth = months[11];
  const totalRevenue = months.reduce((sum, m) => sum + m.mrr + monthlyTrials * trialPrice, 0);
  const totalAdSpend = monthlyAdSpendTotal * 12;
  const netProfit = totalRevenue - totalAdSpend;
  const annualRunRate = (finalMonth?.mrr || 0) * 12;

  const resetToCurrentRates = () => {
    if (stripeMetrics) {
      setTrialToPaidRate(parseFloat(stripeMetrics.rebillRate) || 19.6);
      setMonthlyChurnRate(parseFloat(stripeMetrics.churnRate) || 5);
    }
  };

  const applyScenario = (scenario: 'conservative' | 'scale' | 'aggressive') => {
    if (scenario === 'conservative') {
      setDailyAdSpend(50);
    } else if (scenario === 'scale') {
      setDailyAdSpend(200);
    } else if (scenario === 'aggressive') {
      setDailyAdSpend(500);
      // Apply 10% rate decay for aggressive
      setRegToTrialRate(prev => prev * 0.9);
      setTrialToPaidRate(prev => prev * 0.9);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forecast Calculator</h1>
          <p className="text-gray-600 mt-1">Model different scenarios and project 12-month outcomes</p>
        </div>
        <Link 
          href="/admin/analytics"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back to Analytics
        </Link>
      </div>

      {/* Your Current Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Your Current Metrics</h3>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading from Stripe...</div>
        ) : stripeMetrics ? (
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-blue-600 font-semibold">Reg → Trial: {regToTrialRate}%</span>
            </div>
            <div>
              <span className="text-green-600 font-semibold">Rebill Rate: {stripeMetrics.rebillRate}%</span>
            </div>
            <div>
              <span className="text-orange-600 font-semibold">Churn Rate: {stripeMetrics.churnRate}%</span>
            </div>
            <div>
              <span className="text-purple-600 font-semibold">Active Customers: {stripeMetrics.activeAfterPaying}</span>
            </div>
            <div className="text-gray-500">
              Total who paid $39.97: {stripeMetrics.paidFullPrice} ({stripeMetrics.activeAfterPaying} active + {stripeMetrics.churnedAfterPaying} churned)
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Could not load metrics</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Ad Spend & Acquisition */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📊 Ad Spend & Acquisition</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Daily Ad Spend ($)</label>
                <input
                  type="number"
                  value={dailyAdSpend}
                  onChange={(e) => setDailyAdSpend(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cost per Registration ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPerRegistration}
                  onChange={(e) => setCostPerRegistration(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">🔄 Conversion Rates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Registration → Trial (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={regToTrialRate}
                  onChange={(e) => setRegToTrialRate(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
                <div className="text-xs text-gray-400 mt-1">Current: {regToTrialRate}%</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trial → Paid (Rebill Rate %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={trialToPaidRate}
                  onChange={(e) => setTrialToPaidRate(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
                <div className="text-xs text-gray-400 mt-1">Current: {stripeMetrics?.rebillRate || trialToPaidRate}% (includes churned)</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Monthly Churn (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={monthlyChurnRate}
                  onChange={(e) => setMonthlyChurnRate(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
                <div className="text-xs text-gray-400 mt-1">Current: {stripeMetrics?.churnRate || monthlyChurnRate}% | ≈ {avgRetention.toFixed(1)} months avg retention</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Avg. Retention (months)</label>
                <input
                  type="number"
                  step="0.1"
                  value={avgRetention}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAvgRetention(val);
                    if (val > 0) setMonthlyChurnRate(parseFloat((100 / val).toFixed(1)));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
                <div className="text-xs text-gray-400 mt-1">Linked to churn rate above</div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">💰 Pricing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trial Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={trialPrice}
                  onChange={(e) => setTrialPrice(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              onClick={resetToCurrentRates}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Reset to Current Rates
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Unit Economics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📈 Unit Economics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Cost per Trial</div>
                <div className="text-xl font-bold text-blue-600">${costPerTrial.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Cost per Customer</div>
                <div className="text-xl font-bold text-orange-600">${costPerCustomer.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Lifetime Value</div>
                <div className="text-xl font-bold text-green-600">${ltv.toFixed(2)}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">Net LTV (Profit)</div>
              <div className={`text-2xl font-bold ${netLtv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netLtv.toFixed(2)}
              </div>
            </div>
            <div className={`mt-4 p-3 rounded-lg ${roi >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-sm font-semibold ${roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ROI: {roi.toFixed(0)}%
              </div>
              <div className={`text-xs ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                For every $1 spent on ads, you {roi >= 0 ? 'make' : 'lose'} ${Math.abs(roi / 100).toFixed(2)} {roi >= 0 ? 'back' : ''}
              </div>
            </div>
          </div>

          {/* Projected Volume */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📦 Projected Volume</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-2">Daily</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registrations</span>
                    <span className="font-semibold">{dailyRegistrations.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trials</span>
                    <span className="font-semibold text-blue-600">{dailyTrials.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Customers</span>
                    <span className="font-semibold text-green-600">{dailyNewCustomers.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">Monthly</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registrations</span>
                    <span className="font-semibold">{Math.round(monthlyRegistrations)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trials</span>
                    <span className="font-semibold text-blue-600">{Math.round(monthlyTrials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Customers</span>
                    <span className="font-semibold text-green-600">{Math.round(monthlyNewCustomers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Spend</span>
                    <span className="font-semibold text-red-600">${monthlyAdSpendTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Month Projection Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">🚀 12-Month Projection</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Total Revenue</div>
                <div className="text-lg font-bold text-green-600">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Total Ad Spend</div>
                <div className="text-lg font-bold text-red-600">${totalAdSpend.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Net Profit</div>
                <div className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Final Customer Count</div>
                <div className="text-lg font-bold text-blue-600">{finalMonth?.totalCustomers || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Final MRR</div>
                <div className="text-lg font-bold text-purple-600">${(finalMonth?.mrr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Annual Run Rate</div>
                <div className="text-lg font-bold text-amber-600">${annualRunRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-600">Total New Customers: </span>
                <span className="font-bold text-green-600">+{totalNewCustomers}</span>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-600">Total Churned: </span>
                <span className="font-bold text-red-600">-{totalChurned}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month-by-Month Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">📊 Month-by-Month Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">New</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Churned</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">MRR</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Ad Spend</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Profit</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {months.map((m) => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">Month {m.month}</td>
                  <td className="py-3 px-4 text-right text-green-600">+{m.newCustomers}</td>
                  <td className="py-3 px-4 text-right text-red-500">-{m.churned}</td>
                  <td className="py-3 px-4 text-right font-semibold">{m.totalCustomers}</td>
                  <td className="py-3 px-4 text-right">${m.mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-3 px-4 text-right text-red-600">${m.adSpend.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${m.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${m.cumulativeProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    ${m.cumulativeProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Scenarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">🎯 Quick Scenarios</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => applyScenario('conservative')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-semibold text-gray-900">Conservative</div>
            <div className="text-sm text-gray-500">$50/day, current rates</div>
          </button>
          <button
            onClick={() => applyScenario('scale')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-semibold text-gray-900">Scale Up (4x)</div>
            <div className="text-sm text-gray-500">$200/day, current rates</div>
          </button>
          <button
            onClick={() => applyScenario('aggressive')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-semibold text-gray-900">Aggressive (10x)</div>
            <div className="text-sm text-gray-500">$500/day, 10% rate decay</div>
          </button>
        </div>
      </div>
    </div>
  );
}
