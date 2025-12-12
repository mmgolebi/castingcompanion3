'use client';

import { useState } from 'react';
import ExpensesTracker from './ExpensesTracker';

interface Props {
  children: React.ReactNode;
}

export default function AnalyticsTabWrapper({ children }: Props) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'expenses'>('analytics');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Analytics
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          💰 Expenses
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && children}
      {activeTab === 'expenses' && <ExpensesTracker />}
    </div>
  );
}
