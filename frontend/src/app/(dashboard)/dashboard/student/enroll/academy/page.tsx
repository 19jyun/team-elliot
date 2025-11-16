'use client';

import { useEffect } from 'react';
import { EnrollmentAcademyStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentAcademyStep';

export default function EnrollmentAcademyPage() {

  // 페이지가 unmount될 때 RefundPolicy 동의 상태 초기화
  useEffect(() => {
    return () => {
      const clearRefundPolicyAgreement = async () => {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        SyncStorage.removeItem('refundPolicyAgreed');
      };
      clearRefundPolicyAgreement();
    };
  }, []);

  return <EnrollmentAcademyStep />;
}

