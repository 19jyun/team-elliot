'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePrincipalCreateClassForm } from '@/contexts/forms/PrincipalCreateClassFormContext';
import { CreateClassStepTeacher } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepTeacher';

export default function CreateClassTeacherPage() {
  const router = useRouter();
  const { state } = usePrincipalCreateClassForm();
  const { classFormData } = state;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!classFormData?.name;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    }
  }, [router, classFormData]);

  return <CreateClassStepTeacher />;
}

