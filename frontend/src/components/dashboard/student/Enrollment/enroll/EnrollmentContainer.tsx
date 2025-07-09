'use client';

import React from 'react';
import { useDashboardNavigation, EnrollmentStep } from '@/contexts/DashboardContext';
import { EnrollmentMainStep } from '../EnrollmentMainStep';
import { EnrollmentClassStep } from './EnrollmentClassStep';
import { EnrollmentDateStep } from './EnrollmentDateStep';
import { EnrollmentPaymentStep } from './EnrollmentPaymentStep';
import { EnrollmentCompleteStep } from './EnrollmentCompleteStep';

export function EnrollmentContainer() {
  const { enrollment } = useDashboardNavigation();
  const { currentStep } = enrollment;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'main':
        return <EnrollmentMainStep />;
      case 'class-selection':
        return <EnrollmentClassStep />;
      case 'date-selection':
        return <EnrollmentDateStep />;
      case 'payment':
        return <EnrollmentPaymentStep />;
      case 'complete':
        return <EnrollmentCompleteStep />;
      default:
        return <EnrollmentMainStep />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
} 