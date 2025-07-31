'use client';

import React from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { EnrollmentRefundManagementTabs } from '../components/EnrollmentRefundManagementTabs';
import { PrincipalSessionList } from '../components/PrincipalSessionList';
import { PrincipalRequestDetail } from '../components/PrincipalRequestDetail';

export function EnrollmentRefundManagementContainer() {
  const { personManagement } = usePrincipalContext();
  const { currentStep, selectedSessionId } = personManagement;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'enrollment-refund':
        return selectedSessionId ? <PrincipalRequestDetail /> : <PrincipalSessionList />;
      default:
        return <PrincipalSessionList />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* 탭은 항상 표시 */}
      <div className="flex-shrink-0">
        <EnrollmentRefundManagementTabs />
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 