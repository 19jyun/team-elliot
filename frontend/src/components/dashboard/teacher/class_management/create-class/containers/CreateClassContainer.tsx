'use client';

import React from 'react';
import { useDashboardNavigation, CreateClassStep } from '@/contexts/DashboardContext';
import { CreateClassStep1 } from '../components/CreateClassStep1';
import { CreateClassStep2 } from '../components/CreateClassStep2';
import { CreateClassStep3 } from '../components/CreateClassStep3';
import { CreateClassComplete } from '../components/CreateClassComplete';

export function CreateClassContainer() {
  const { createClass } = useDashboardNavigation();
  const { currentStep } = createClass;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return <CreateClassStep1 />;
      case 'schedule':
        return <CreateClassStep2 />;
      case 'content':
        return <CreateClassStep3 />;
      case 'complete':
        return <CreateClassComplete />;
      default:
        return <CreateClassStep1 />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
} 