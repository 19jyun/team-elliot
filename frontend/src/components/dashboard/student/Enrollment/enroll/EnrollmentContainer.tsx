'use client';

import React from 'react';
import { useDashboardNavigation, EnrollmentStep } from '@/contexts/DashboardContext';
import { EnrollmentAcademyStep } from './EnrollmentAcademyStep';
import { EnrollmentClassStep } from './EnrollmentClassStep';
import { EnrollmentDateStep } from './EnrollmentDateStep';
import { EnrollmentPaymentStep } from './EnrollmentPaymentStep';
import { EnrollmentCompleteStep } from './EnrollmentCompleteStep';

export function EnrollmentContainer() {
  const { enrollment } = useDashboardNavigation();
  const { currentStep } = enrollment;

  console.log('EnrollmentContainer 렌더링됨, currentStep:', currentStep);

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    console.log('renderCurrentStep 호출됨, currentStep:', currentStep);
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