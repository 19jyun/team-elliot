'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { EnrollmentAcademyStep } from './EnrollmentAcademyStep';
import { EnrollmentClassStep } from './EnrollmentClassStep';
import { EnrollmentDateStep } from './EnrollmentDateStep';
import { EnrollmentPaymentStep } from './EnrollmentPaymentStep';
import { EnrollmentCompleteStep } from './EnrollmentCompleteStep';

export function EnrollmentContainer() {
  const { form } = useApp();
  const { enrollment } = form;
  const { currentStep } = enrollment;

  // EnrollmentContainer가 unmount될 때 RefundPolicy 동의 상태 초기화
  useEffect(() => {
    return () => {
      const clearRefundPolicyAgreement = async () => {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        SyncStorage.removeItem('refundPolicyAgreed');
      };
      clearRefundPolicyAgreement();
    };
  }, []);


  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'academy-selection':
        return <EnrollmentAcademyStep />;
      case 'class-selection':
        return <EnrollmentClassStep />;
      case 'date-selection':
        return <EnrollmentDateStep />;
      case 'payment':
        return <EnrollmentPaymentStep />;
      case 'complete':
        return <EnrollmentCompleteStep />;
      default:
        return <EnrollmentAcademyStep />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
} 