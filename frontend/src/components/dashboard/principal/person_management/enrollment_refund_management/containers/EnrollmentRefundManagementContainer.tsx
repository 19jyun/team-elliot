'use client';

import React from 'react';
import { useApp } from '@/contexts';
import { EnrollmentRefundManagementTabs } from '../components/navigation/EnrollmentRefundManagementTabs';
import { PrincipalClassList } from '../components/navigation/PrincipalClassList';
import { PrincipalSessionList } from '../components/sessions/PrincipalSessionList';
import { PrincipalRequestDetail } from '../components/requests/PrincipalRequestDetail';

export function EnrollmentRefundManagementContainer() {
  const { form } = useApp();
  const { personManagement } = form;
  const { currentStep, selectedSessionId } = personManagement;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'class-list':
        return <PrincipalClassList />;
      case 'session-list':
        return <PrincipalSessionList />;
      case 'request-detail':
        return selectedSessionId ? <PrincipalRequestDetail /> : <PrincipalSessionList />;
      default:
        return <PrincipalClassList />;
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