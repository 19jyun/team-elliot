'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { EnrollmentDateStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentDateStep';

export default function EnrollmentDatePage() {
  const router = useRouter();
  const { enrollment } = useApp().form;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const isAcademyFilled = !!enrollment.selectedAcademyId;
    const isClassFilled = enrollment.selectedClassIds.length > 0;

    if (!isAcademyFilled) {
      router.replace('/dashboard/student/enroll/academy');
    } else if (!isClassFilled) {
      router.replace('/dashboard/student/enroll/academy/class');
    }
  }, [router, enrollment]);

  return <EnrollmentDateStep />;
}

