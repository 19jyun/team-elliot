'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePrincipalCreateClassForm } from '@/contexts/forms/PrincipalCreateClassFormContext';
import { CreateClassStepDetail } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepDetail';

export default function CreateClassContentPage() {
  const router = useRouter();
  const { state } = usePrincipalCreateClassForm();
  const { classFormData, selectedTeacherId } = state;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!classFormData?.name;
    const hasSelectedTeacher = !!selectedTeacherId;
    const hasSchedule = classFormData?.schedule && classFormData.schedule.length > 0;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    } else if (!hasSelectedTeacher) {
      router.replace('/dashboard/principal/class/create-class/info/teacher');
    } else if (!hasSchedule) {
      router.replace('/dashboard/principal/class/create-class/info/teacher/schedule');
    }
  }, [router, classFormData, selectedTeacherId]);

  return <CreateClassStepDetail />;
}

