'use client';

import { useState, useEffect } from 'react';

interface FBData {
  total: {
    spend: number;
    trials: number;
    registrations: number;
  };
  adsets: {
    name: string;
    campaign: string;
    spend: number;
    trials: number;
  }[];
}

export default function ForecastPage() {
  const [fbData, setFbData] = useState<FBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState('this_month');
  
  // Editable assumptions
  const [rebillRate, setRebillRate] = useState(50);
  const [monthlyChurnRate, setMonthlyChurnRate] = useState(15);
  const [avgLifespan, setAvgLifespan] = useState(3);
  const [monthlyAdBudget, setMonthlyAdBudget] = useState(5000);
  const [fixedCosts] = useState(297);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/fb-ads?preset=${datePreset}`);
        const data = await res.json();
        setFbData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [datePreset]);

  const monthlyPrice = 39.97;
  const ltv = monthlyPrice * avgLifespan;
  
  // Calculate based on current performance
  const cpt = fbData && fbData.total.trials > 0 
    ? fbData.total.spend / fbData.total.trials 
    : 20;
  
  const projectedTrials = monthlyAdBudget / cpt;
  const projectedConversions = projectedTrials * (rebillRate / 100);
  const cac = projectedConversions > 0 ? monthlyAdBudget / projectedConversions : 0;
  
  // 6-month projection
  const months = [];
  let activeCustomers = 0;
  let cumulativeProfit = 0;
  const churnDecimal = monthlyChurnRate / 100;
  
  for (let i = 1; i <= 6; i++) {
    const label = new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const newCustomers = Math.floor(projectedConversions);
    const churned = Math.floor(activeCustomers * churnDecimal);
    activeCustomers = activeCustomers + newCustomers - churned;
    
    const mrr = activeCustomers * monthlyPrice;
    const trialRev = projectedTrials * 1;
    const revenue = mrr + trialRev;
    const costs = monthlyAdBudget + fixedCosts;
    const profit = revenue - costs;
    cumulativeProfit += profit;
    
    months.push({ label, newCustomers, churned, activeCustomers, mrr, revenue, costs, profit, cumulativeProfit });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecast Calculator</h1>
        <p className="text-gray-600 mt-1">Project future revenue based on ad spend assumptions</p>
      </div>

      {/* Input Assumptions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Assumptions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Monthly Ad Budget</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">$</span>
              <input
                type="number"
                value={monthlyAdBudget}
                onChange={(e) => setMonthlyAdBudget(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Rebill Rate</label>
            <div className="flex items-center">
              <input
                type="number"
                value={rebillRate}
                onChange={(e) => setRebillRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <span className="text-gray-500 ml-1">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Monthly Churn</label>
            <div className="flex items-center">
              <input
                type="number"
                value={monthlyChurnRate}
                onChange={(e) => setMonthlyChurnRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <span className="text-gray-500 ml-1">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Avg Lifespan</label>
            <div className="flex items-center">
              <input
                type="number"
                value={avgLifespan}
                onChange={(e) => setAvgLifespan(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <span className="text-gray-500 ml-1">mo</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fixed Costs</label>
            <div className="flex items-center text-gray-500">
              <span className="mr-1">$</span>
              <span className="font-medium">{fixedCosts}</span>
              <span className="ml-1">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="text-sm font-medium text-blue-600">Current CPT</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">${cpt.toFixed(2)}</div>
          <div className="text-xs text-blue-600 mt-1">Cost per trial</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="text-sm font-medium text-green-600">Projected Trials/mo</div>
          <div className="text-3xl font-bold text-green-900 mt-1">{Math.floor(projectedTrials)}</div>
          <div className="text-xs text-green-600 mt-1">At ${monthlyAdBudget} spend</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="text-sm font-medium text-purple-600">Est. LTV</div>
          <div className="text-3xl font-bold text-purple-900 mt-1">${ltv.toFixed(2)}</div>
          <div className="text-xs text-purple-600 mt-1">{avgLifespan} months × $39.97</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div className="text-sm font-medium text-amber-600">CAC</div>
          <div className={`text-3xl font-bold mt-1 ${cac < ltv ? 'text-amber-900' : 'text-red-600'}`}>
            ${cac.toFixed(2)}
          </div>
          <div className="text-xs text-amber-600 mt-1">
            LTV:CAC = {(ltv/cac).toFixed(1)}x
          </div>
        </div>
      </div>

      {/* 6-Month Projection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">6-Month Projection</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">New</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Churned</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Active</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">MRR</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Costs</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Profit</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {months.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{m.label}</td>
                  <td className="py-3 px-4 text-right text-green-600">+{m.newCustomers}</td>
                  <td className="py-3 px-4 text-right text-red-500">-{m.churned}</td>
                  <td className="py-3 px-4 text-right font-semibold">{m.activeCustomers}</td>
                  <td className="py-3 px-4 text-right text-emerald-600">${m.mrr.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-green-600">${m.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-pink-600">${m.costs.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.profit >= 0 ? '+' : ''}${m.profit.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${m.cumulativeProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    ${m.cumulativeProfit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="text-emerald-100">At ${monthlyAdBudget}/month ad spend, in 6 months:</div>
            <div className="text-3xl font-bold mt-1">{months[5]?.activeCustomers || 0} active customers</div>
            <div className="text-emerald-100 mt-1">generating ${months[5]?.mrr.toFixed(2) || 0}/mo MRR</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-100">6-Month Cumulative:</div>
            <div className={`text-4xl font-bold ${(months[5]?.cumulativeProfit || 0) >= 0 ? '' : 'text-red-200'}`}>
              ${months[5]?.cumulativeProfit.toFixed(2) || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
