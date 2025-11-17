'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  currentMetrics: {
    regToTrialRate: number;
    rebillRate: number;
    currentMRR: number;
    activeCustomers: number;
  };
}

export default function ForecastCalculator({ currentMetrics }: Props) {
  // Input variables
  const [costPerRegistration, setCostPerRegistration] = useState(5);
  const [dailyAdSpend, setDailyAdSpend] = useState(50);
  const [regToTrialRate, setRegToTrialRate] = useState(currentMetrics.regToTrialRate);
  const [rebillRate, setRebillRate] = useState(currentMetrics.rebillRate);
  const [monthlyChurn, setMonthlyChurn] = useState(15); // % of customers who cancel per month
  const [trialPrice, setTrialPrice] = useState(1);
  const [monthlyPrice, setMonthlyPrice] = useState(39.97);
  const [averageRetentionMonths, setAverageRetentionMonths] = useState(4);

  // Calculated metrics
  const [calculations, setCalculations] = useState<any>({});

  useEffect(() => {
    // Daily metrics
    const dailyRegistrations = dailyAdSpend / costPerRegistration;
    const dailyTrials = dailyRegistrations * (regToTrialRate / 100);
    const dailyNewCustomers = dailyTrials * (rebillRate / 100);
    
    // Cost metrics
    const costPerTrial = costPerRegistration / (regToTrialRate / 100);
    const costPerCustomer = costPerTrial / (rebillRate / 100);
    
    // Revenue metrics
    const trialRevenuePerCustomer = trialPrice;
    const ltv = monthlyPrice * averageRetentionMonths;
    const ltvWithTrial = ltv + trialPrice;
    const netLTV = ltvWithTrial - costPerCustomer;
    const roiPercent = ((ltvWithTrial - costPerCustomer) / costPerCustomer) * 100;

    // Monthly projections
    const monthlyRegistrations = dailyRegistrations * 30;
    const monthlyTrials = dailyTrials * 30;
    const monthlyNewCustomers = dailyNewCustomers * 30;
    const monthlyAdSpend = dailyAdSpend * 30;
    const monthlyTrialRevenue = monthlyTrials * trialPrice;
    
    // 12-month forecast with churn
    const monthlyData = [];
    let cumulativeCustomers = currentMetrics.activeCustomers;
    let cumulativeRevenue = 0;
    let cumulativeAdSpend = 0;
    let cumulativeTrialRevenue = 0;
    let cumulativeProfit = 0;

    for (let month = 1; month <= 12; month++) {
      // New customers this month (accounting for 14-day trial delay)
      const newCustomers = month === 1 
        ? monthlyNewCustomers * 0.5 // First month only half convert (trial delay)
        : monthlyNewCustomers;
      
      // Churn from existing customers
      const churnedCustomers = cumulativeCustomers * (monthlyChurn / 100);
      
      // Net customer change
      cumulativeCustomers = cumulativeCustomers + newCustomers - churnedCustomers;
      
      // Revenue this month
      const subscriptionRevenue = cumulativeCustomers * monthlyPrice;
      const trialRevenue = monthlyTrials * trialPrice;
      const totalRevenue = subscriptionRevenue + trialRevenue;
      
      // Costs this month
      const adSpend = monthlyAdSpend;
      
      // Profit
      const profit = totalRevenue - adSpend;
      
      // Cumulative
      cumulativeRevenue += totalRevenue;
      cumulativeAdSpend += adSpend;
      cumulativeTrialRevenue += trialRevenue;
      cumulativeProfit += profit;

      monthlyData.push({
        month,
        newCustomers: Math.round(newCustomers),
        churnedCustomers: Math.round(churnedCustomers),
        totalCustomers: Math.round(cumulativeCustomers),
        mrr: subscriptionRevenue,
        trialRevenue,
        totalRevenue,
        adSpend,
        profit,
        cumulativeProfit,
      });
    }

    setCalculations({
      daily: {
        registrations: dailyRegistrations,
        trials: dailyTrials,
        newCustomers: dailyNewCustomers,
      },
      costs: {
        perTrial: costPerTrial,
        perCustomer: costPerCustomer,
      },
      revenue: {
        ltv: ltvWithTrial,
        netLTV,
        roiPercent,
      },
      monthly: {
        registrations: monthlyRegistrations,
        trials: monthlyTrials,
        newCustomers: monthlyNewCustomers,
        adSpend: monthlyAdSpend,
        trialRevenue: monthlyTrialRevenue,
      },
      yearForecast: monthlyData,
      yearTotals: {
        revenue: cumulativeRevenue,
        adSpend: cumulativeAdSpend,
        profit: cumulativeProfit,
        finalCustomers: Math.round(cumulativeCustomers),
        finalMRR: cumulativeCustomers * monthlyPrice,
      },
    });
  }, [
    costPerRegistration,
    dailyAdSpend,
    regToTrialRate,
    rebillRate,
    monthlyChurn,
    trialPrice,
    monthlyPrice,
    averageRetentionMonths,
    currentMetrics.activeCustomers,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forecast Calculator</h1>
            <p className="text-gray-600 mt-1">Model different scenarios and project 12-month outcomes</p>
          </div>
          <Link
            href="/admin/analytics"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back to Analytics
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Ad Spend & Acquisition</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Ad Spend ($)
                  </label>
                  <input
                    type="number"
                    value={dailyAdSpend}
                    onChange={(e) => setDailyAdSpend(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Registration ($)
                  </label>
                  <input
                    type="number"
                    value={costPerRegistration}
                    onChange={(e) => setCostPerRegistration(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">🔄 Conversion Rates</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration → Trial (%)
                  </label>
                  <input
                    type="number"
                    value={regToTrialRate}
                    onChange={(e) => setRegToTrialRate(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {currentMetrics.regToTrialRate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trial → Paid (Rebill Rate %)
                  </label>
                  <input
                    type="number"
                    value={rebillRate}
                    onChange={(e) => setRebillRate(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {currentMetrics.rebillRate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Churn (%)
                  </label>
                  <input
                    type="number"
                    value={monthlyChurn}
                    onChange={(e) => setMonthlyChurn(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    % of customers who cancel each month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">💰 Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trial Price ($)
                  </label>
                  <input
                    type="number"
                    value={trialPrice}
                    onChange={(e) => setTrialPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg. Retention (months)
                  </label>
                  <input
                    type="number"
                    value={averageRetentionMonths}
                    onChange={(e) => setAverageRetentionMonths(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                    step="1"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setRegToTrialRate(currentMetrics.regToTrialRate);
                setRebillRate(currentMetrics.rebillRate);
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reset to Current Rates
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Economics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📈 Unit Economics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Cost per Trial</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${calculations.costs?.perTrial?.toFixed(2) || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Cost per Customer</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${calculations.costs?.perCustomer?.toFixed(2) || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Lifetime Value</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${calculations.revenue?.ltv?.toFixed(2) || '0'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Net LTV (Profit)</div>
                  <div className={`text-2xl font-bold ${(calculations.revenue?.netLTV || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculations.revenue?.netLTV?.toFixed(2) || '0'}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-900">
                  ROI: {calculations.revenue?.roiPercent?.toFixed(0) || '0'}%
                </div>
                <div className="text-xs text-blue-700">
                  For every $1 spent on ads, you make ${((calculations.revenue?.roiPercent || 0) / 100 + 1).toFixed(2)} back
                </div>
              </div>
            </div>

            {/* Daily/Monthly Projections */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📅 Projected Volume</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Daily</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registrations</span>
                      <span className="font-medium">{calculations.daily?.registrations?.toFixed(1) || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trials</span>
                      <span className="font-medium text-blue-600">{calculations.daily?.trials?.toFixed(1) || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Customers</span>
                      <span className="font-medium text-green-600">{calculations.daily?.newCustomers?.toFixed(2) || '0'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registrations</span>
                      <span className="font-medium">{calculations.monthly?.registrations?.toFixed(0) || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trials</span>
                      <span className="font-medium text-blue-600">{calculations.monthly?.trials?.toFixed(0) || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Customers</span>
                      <span className="font-medium text-green-600">{calculations.monthly?.newCustomers?.toFixed(0) || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ad Spend</span>
                      <span className="font-medium text-red-600">${calculations.monthly?.adSpend?.toFixed(0) || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Month Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-green-900">🎯 12-Month Projection</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${calculations.yearTotals?.revenue?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                  </div>
                </div>
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Total Ad Spend</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${calculations.yearTotals?.adSpend?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                  </div>
                </div>
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Net Profit</div>
                  <div className={`text-2xl font-bold ${(calculations.yearTotals?.profit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculations.yearTotals?.profit?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                  </div>
                </div>
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Final Customer Count</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculations.yearTotals?.finalCustomers || '0'}
                  </div>
                </div>
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Final MRR</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${calculations.yearTotals?.finalMRR?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                  </div>
                </div>
                <div className="bg-white rounded p-4">
                  <div className="text-xs font-medium text-gray-500">Annual Run Rate</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${((calculations.yearTotals?.finalMRR || 0) * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Month by Month Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📆 Month-by-Month Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-500">Month</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">New</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Churned</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Total</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">MRR</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Ad Spend</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Profit</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.yearForecast?.map((month: any) => (
                      <tr key={month.month} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">Month {month.month}</td>
                        <td className="py-2 px-2 text-right text-green-600">+{month.newCustomers}</td>
                        <td className="py-2 px-2 text-right text-red-600">-{month.churnedCustomers}</td>
                        <td className="py-2 px-2 text-right font-medium">{month.totalCustomers}</td>
                        <td className="py-2 px-2 text-right">${month.mrr.toFixed(0)}</td>
                        <td className="py-2 px-2 text-right text-red-600">${month.adSpend.toFixed(0)}</td>
                        <td className={`py-2 px-2 text-right font-medium ${month.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${month.profit.toFixed(0)}
                        </td>
                        <td className={`py-2 px-2 text-right font-medium ${month.cumulativeProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${month.cumulativeProfit.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scenario Presets */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">🎮 Quick Scenarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setDailyAdSpend(50);
                    setCostPerRegistration(5);
                    setRegToTrialRate(currentMetrics.regToTrialRate);
                    setRebillRate(currentMetrics.rebillRate);
                  }}
                  className="p-4 border rounded hover:bg-gray-50 text-left"
                >
                  <div className="font-medium">Conservative</div>
                  <div className="text-sm text-gray-600">$50/day, current rates</div>
                </button>
                <button
                  onClick={() => {
                    setDailyAdSpend(200);
                    setCostPerRegistration(5);
                    setRegToTrialRate(currentMetrics.regToTrialRate);
                    setRebillRate(currentMetrics.rebillRate);
                  }}
                  className="p-4 border rounded hover:bg-gray-50 text-left"
                >
                  <div className="font-medium">Scale Up (4x)</div>
                  <div className="text-sm text-gray-600">$200/day, current rates</div>
                </button>
                <button
                  onClick={() => {
                    setDailyAdSpend(500);
                    setCostPerRegistration(6);
                    setRegToTrialRate(currentMetrics.regToTrialRate * 0.9);
                    setRebillRate(currentMetrics.rebillRate * 0.9);
                  }}
                  className="p-4 border rounded hover:bg-gray-50 text-left"
                >
                  <div className="font-medium">Aggressive (10x)</div>
                  <div className="text-sm text-gray-600">$500/day, 10% rate decay</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
