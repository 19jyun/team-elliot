import React from 'react';
import { useAdminContext } from '@/contexts/AdminContext';

const adminTabs = [
  { label: '수강생 관리', value: 0 },
  { label: '선생님 관리', value: 1 },
  { label: '수업 관리', value: 2 },
];

export function AdminNavigation() {
  const { activeTab, setActiveTab } = useAdminContext();

  return (
    <nav className="flex items-center justify-center px-5 w-full bg-white border-b border-stone-200">
      <div className="flex justify-center gap-1 w-full max-w-[480px]">
        {adminTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === tab.value
                ? 'text-stone-900 border-b-2 border-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
} 