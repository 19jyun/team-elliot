'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { CreateClassStepSchedule } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassStepSchedule';

export default function CreateClassSchedulePage() {
  const router = useRouter();
  const { createClass } = useApp().form;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!createClass.classFormData?.name;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    }
  }, [router, createClass]);

  return <CreateClassStepSchedule />;
}

