'use client';

import React from 'react';
import { useDashboardNavigation, CreateClassStep } from '@/contexts/DashboardContext';
import { CreateClassStepInfo } from '../components/CreateClassStepInfo';
import { CreateClassStepTeacher } from '../components/CreateClassStepTeacher';
import { CreateClassStepSchedule } from '../components/CreateClassStepSchedule';
import { CreateClassStepDetail } from '../components/CreateClassStepDetail';
import { CreateClassComplete } from '../components/CreateClassComplete';

export function CreateClassContainer() {
  const { createClass } = useDashboardNavigation();
  const { currentStep } = createClass;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return <CreateClassStepInfo />;
      case 'teacher':
        return <CreateClassStepTeacher />;
      case 'schedule':
        return <CreateClassStepSchedule />;
      case 'content':
        return <CreateClassStepDetail />;
      case 'complete':
        return <CreateClassComplete />;
      default:
        return <CreateClassStepInfo />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
} 