'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { EnrollmentManagementTabs } from '../components/EnrollmentManagementTabs';
import { SessionList } from '../components/SessionList';
import { RequestDetail } from '../components/RequestDetail';

export function EnrollmentManagementContainer() {
  const { enrollmentManagement, goBack } = useDashboardNavigation();
  const { currentStep, selectedTab } = enrollmentManagement;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'session-list':
        return <SessionList />;
      case 'request-detail':
        return <RequestDetail />;
      default:
        return <SessionList />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* 탭은 항상 표시 */}
      <div className="flex-shrink-0">
        <EnrollmentManagementTabs />
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 