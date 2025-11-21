'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePrincipalCreateClassForm } from '@/contexts/forms/PrincipalCreateClassFormContext';
import { CreateClassStepSchedule } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepSchedule';

export default function CreateClassSchedulePage() {
  const router = useRouter();
  const { state } = usePrincipalCreateClassForm();
  const { classFormData, selectedTeacherId } = state;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!classFormData?.name;
    const hasSelectedTeacher = !!selectedTeacherId;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    } else if (!hasSelectedTeacher) {
      router.replace('/dashboard/principal/class/create-class/info/teacher');
    }
  }, [router, classFormData, selectedTeacherId]);

  return <CreateClassStepSchedule />;
}

