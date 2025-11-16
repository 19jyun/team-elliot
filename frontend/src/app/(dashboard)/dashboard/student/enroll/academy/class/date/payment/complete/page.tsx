'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { EnrollmentCompleteStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentCompleteStep';

export default function EnrollmentCompletePage() {
  const router = useRouter();
  const { enrollment } = useApp().form;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const isDateFilled = enrollment.selectedSessions.length > 0;

    if (!isDateFilled) {
      router.replace('/dashboard/student/enroll/academy/class/date');
    }
  }, [router, enrollment]);

  return <EnrollmentCompleteStep />;
}

