'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { CreateClassComplete } from '@/components/dashboard/principal/class_management/create-class/components/CreateClassComplete';

export default function CreateClassCompletePage() {
  const router = useRouter();
  const { principalCreateClass } = useApp().form;
  const { classFormData } = principalCreateClass;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const hasClassFormData = !!classFormData?.name;

    if (!hasClassFormData) {
      router.replace('/dashboard/principal/class/create-class/info');
    }
  }, [router, classFormData]);

  return <CreateClassComplete />;
}

