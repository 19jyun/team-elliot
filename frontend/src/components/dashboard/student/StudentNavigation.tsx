import React from 'react';
import { useStudentContext } from '@/contexts/StudentContext';

const studentTabs = [
  { label: '클래스 정보', value: 0 },
  { label: '수강신청', value: 1 },
  { label: '나의 정보', value: 2 },
];

export function StudentNavigation() {
  const { activeTab, setActiveTab } = useStudentContext();

  return (
    <nav className="flex items-center justify-center px-5 w-full bg-white border-b border-stone-200">
      <div className="flex justify-center gap-1 w-full max-w-[480px]">
        {studentTabs.map((tab) => (
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