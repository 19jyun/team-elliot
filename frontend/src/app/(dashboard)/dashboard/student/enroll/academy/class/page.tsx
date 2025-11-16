'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/contexts';
import { EnrollmentClassStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentClassStep';

export default function EnrollmentClassPage() {
  const router = useRouter();
  const { enrollment } = useApp().form;

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    const isAcademyFilled = !!enrollment.selectedAcademyId;
    
    if (!isAcademyFilled) {
      router.replace('/dashboard/student/enroll/academy');
    }
  }, [router, enrollment]);

  return <EnrollmentClassStep />;
}

