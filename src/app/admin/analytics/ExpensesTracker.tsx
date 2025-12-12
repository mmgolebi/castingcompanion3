'use client';

import { useState } from 'react';

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category: 'infrastructure' | 'ai' | 'marketing' | 'tools' | 'other';
  url?: string;
  notes?: string;
}

// Initial expenses data - you can modify these values
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
};

export default function ExpensesTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    frequency: 'monthly',
    category: 'other',
  });

  // Calculate totals
  const monthlyTotal = expenses.reduce((sum, exp) => {
    if (exp.frequency === 'monthly') return sum + exp.amount;
    return sum + (exp.amount / 12); // Convert yearly to monthly
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Group by category
  const byCategory = expenses.reduce((acc, exp) => {
    const monthly = exp.frequency === 'monthly' ? exp.amount : exp.amount / 12;
    acc[exp.category] = (acc[exp.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

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

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Monthly Total</h3>
          <p className="text-3xl font-bold text-gray-900">${monthlyTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Yearly Total</h3>
          <p className="text-3xl font-bold text-gray-900">${yearlyTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">per year</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Break-even Customers</h3>
          <p className="text-3xl font-bold text-green-600">{Math.ceil(monthlyTotal / 39.97)}</p>
          <p className="text-sm text-gray-500 mt-1">@ $39.97/mo each</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Expenses by Category</h2>
        <div className="space-y-3">
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
              const percentage = (amount / monthlyTotal) * 100;
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
                  <div className="w-24 text-right">
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm ml-1">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">💰 All Expenses</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Expense
          </button>
        </div>

        {/* Add Form */}
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

        {/* Table */}
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
                <td className="py-3 px-4 font-bold">Total</td>
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
          💡 <strong>Note:</strong> You need at least <strong>{Math.ceil(monthlyTotal / 39.97)} paying customers</strong> at $39.97/mo 
          to cover your monthly expenses of ${monthlyTotal.toFixed(2)}. 
          Each customer beyond that is pure profit!
        </p>
      </div>
    </div>
  );
}
