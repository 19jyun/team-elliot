'use client';

import { useEffect } from 'react';
import { CreateClassStepInfo } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepInfo';
import { useApp } from '@/contexts/AppContext';

export default function CreateClassInfoPage() {
  const { resetPrincipalCreateClass } = useApp();

  useEffect(() => {
    resetPrincipalCreateClass();
  }, [resetPrincipalCreateClass]);

  return <CreateClassStepInfo />;
}

