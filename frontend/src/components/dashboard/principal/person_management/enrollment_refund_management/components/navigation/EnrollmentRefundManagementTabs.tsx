'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

export function EnrollmentRefundManagementTabs() {
  const { form, switchPrincipalPersonManagementTab } = useApp();
  const { principalPersonManagement } = form;
  const { selectedTab } = principalPersonManagement;

  const handleTabClick = (tab: 'enrollment' | 'refund') => {
    switchPrincipalPersonManagementTab(tab);
  };

  return (
    <div className="flex border-b border-stone-200 bg-white">
      <button
        onClick={() => handleTabClick('enrollment')}
        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
          selectedTab === 'enrollment'
            ? 'text-primary border-b-2 border-primary'
            : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        수강 신청 관리
      </button>
      <button
        onClick={() => handleTabClick('refund')}
        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
          selectedTab === 'refund'
            ? 'text-primary border-b-2 border-primary'
            : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        환불 신청 관리
      </button>
    </div>
  );
} 