'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { EnrollmentPaymentStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentPaymentStep';

export default function EnrollmentPaymentPage() {
  const router = useRouter();
  const { enrollment } = useApp().form;
  const { selectedAcademyId, selectedClassIds, selectedSessions } = enrollment;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const isAcademyFilled = !!selectedAcademyId;
    const isClassFilled = selectedClassIds.length > 0;
    const isDateFilled = selectedSessions.length > 0;

    if (!isAcademyFilled) {
      router.replace('/dashboard/student/enroll/academy');
    } else if (!isClassFilled) {
      router.replace('/dashboard/student/enroll/academy/class');
    } else if (!isDateFilled) {
      router.replace('/dashboard/student/enroll/academy/class/date');
    }
  }, [router, selectedAcademyId, selectedClassIds, selectedSessions]);

  return <EnrollmentPaymentStep />;
}

