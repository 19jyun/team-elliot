'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { EnrollmentModificationDateStep } from './EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from './EnrollmentModificationPaymentStep';
import { EnrollmentCompleteStep } from '../enroll/EnrollmentCompleteStep';
import { RefundRequestStep } from './RefundRequestStep';
import { RefundCompleteStep } from './RefundCompleteStep';
import { useStudentEnrollmentHistory } from '@/hooks/queries/student/useStudentEnrollmentHistory';
import type { ModificationSessionVM } from '@/types/view/student';
import type { EnrollmentModificationContainerVM } from '@/types/view/student';

export function EnrollmentModificationContainer({ classId, month }: EnrollmentModificationContainerVM) {
  const { form, resetEnrollmentModification } = useApp();
  const { enrollmentModification } = form;
  const { currentStep, modificationData } = enrollmentModification;
  
  // React Query 기반 데이터 관리
  const { data: enrollmentHistory = [], isLoading, error } = useStudentEnrollmentHistory();

  // EnrollmentModificationContainer가 마운트될 때 진행상황 초기화
  useEffect(() => {
    // Container가 열릴 때마다 수강 변경 진행상황 초기화
    resetEnrollmentModification();
  }, [resetEnrollmentModification]);

  // EnrollmentModificationContainer가 unmount될 때 정리
  useEffect(() => {
    return () => {
      // Cleanup: 컴포넌트가 unmount될 때 실행
      const clearRefundPolicyAgreement = async () => {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        SyncStorage.removeItem('refundPolicyAgreement');
      };
      clearRefundPolicyAgreement();
    };
  }, []);
  

  // 해당 클래스의 수강 신청 정보 필터링 (ViewModel로 정규화)
  // EnrollmentModificationDateStep에 props로 전달하기 위해 필요
  const existingEnrollments: ModificationSessionVM[] = React.useMemo(() => {
    if (!enrollmentHistory) {
      return [];
    }

    const filtered = enrollmentHistory.filter((enrollment) =>
      enrollment.session.class.id === classId
    );

    const result = filtered.map((enrollment) => ({
      id: enrollment.session.id,
      date: enrollment.session.date,
      startTime: enrollment.session.startTime,
      endTime: enrollment.session.endTime,
      class: enrollment.session.class,
      isAlreadyEnrolled: enrollment.status !== 'REJECTED', // REJECTED 상태는 수강 중이 아님
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        description: enrollment.description,
        refundRejection: enrollment.refundRejection,
      },
    }));
    
    return result;
  }, [enrollmentHistory, classId]);

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'date-selection':
        return (
          <EnrollmentModificationDateStep
            classId={classId}
            existingEnrollments={existingEnrollments}
            month={month}
          />
        );
      case 'payment':
        if (!modificationData) {
          return null;
        }
        return (
          <EnrollmentModificationPaymentStep
            modificationData={modificationData}
          />
        );
      case 'refund-request':
        if (!modificationData) {
          return null;
        }
        return (
          <RefundRequestStep
            modificationData={modificationData}
          />
        );
      case 'refund-complete':
        // 환불 신청 완료인지 수강 변경 완료인지 구분
        const isRefundRequest = modificationData?.changeType === 'refund';
        return (
          <RefundCompleteStep
            refundAmount={modificationData?.changeAmount || 0}
            cancelledSessionsCount={modificationData?.cancelledSessionsCount || 0}
            isModification={!isRefundRequest}
          />
        );
      case 'complete':
        return <EnrollmentCompleteStep />;
      default:
        return (
          <EnrollmentModificationDateStep
            classId={classId}
            existingEnrollments={existingEnrollments}
            month={month}
          />
        );
    }
  };

  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">수강 변경 정보를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
        <p className="mt-2 text-sm text-gray-600">수강 변경 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {renderCurrentStep()}
    </div>
  );
} 