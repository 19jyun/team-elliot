'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { CreateClassStepTeacher } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepTeacher';

export default function CreateClassTeacherPage() {
  const router = useRouter();
  const { principalCreateClass } = useApp().form;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!principalCreateClass.classFormData.name;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    }
  }, [router, principalCreateClass]);

  return <CreateClassStepTeacher />;
}

