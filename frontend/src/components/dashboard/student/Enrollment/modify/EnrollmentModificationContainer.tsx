'use client';

import React, { useEffect, useState } from 'react';
import { useImprovedApp } from '@/contexts/ImprovedAppContext';
import { EnrollmentModificationDateStep } from './EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from './EnrollmentModificationPaymentStep';
import { EnrollmentCompleteStep } from '../enroll/EnrollmentCompleteStep';
import { RefundRequestStep } from './RefundRequestStep';
import { RefundCompleteStep } from './RefundCompleteStep';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation';
import type { ModificationSessionVM } from '@/types/view/student';
import type { EnrollmentModificationContainerVM } from '@/types/view/student';

export function EnrollmentModificationContainer({ classId, month }: EnrollmentModificationContainerVM) {
  const { form, setEnrollmentStep } = useImprovedApp();
  const { enrollment } = form;
  const { currentStep } = enrollment;
  const { enrollmentHistory, isLoading, error, loadEnrollmentHistory } = useStudentApi();
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<number>>(new Set());
  const [refundAmount, setRefundAmount] = useState(0);
  const [cancelledSessionsCount, setCancelledSessionsCount] = useState(0);
  const [sessionPrice, setSessionPrice] = useState(50000); // 기본값


  // 수강 변경 모드로 설정 - 즉시 설정
  useEffect(() => {
    setEnrollmentStep('date-selection');
  }, [setEnrollmentStep]);

  // 수강 신청 내역 로드
  useEffect(() => {
    loadEnrollmentHistory();
  }, [loadEnrollmentHistory]);

  // 수강 변경 모드에서는 항상 date-selection 단계로 강제 설정
  const effectiveStep = (currentStep as string) === 'main' ? 'date-selection' : currentStep;
  

  // Redux에서 해당 클래스의 수강 신청 정보 필터링 (ViewModel로 정규화)
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

  // 수강 변경 금액 계산
  const { change } = useEnrollmentCalculation({
    originalEnrollments: existingEnrollments,
    selectedSessionIds,
    sessionPrice: sessionPrice
  });
  

  // 세션 선택 완료 시 처리
  const handleSessionSelectionComplete = (sessionIds: Set<number>, sessionPrice?: number) => {
    setSelectedSessionIds(sessionIds);
    
    // 전달받은 sessionPrice가 있으면 사용, 없으면 기존 값 사용
    const actualSessionPrice = sessionPrice || 50000;
    
    // sessionPrice 상태 업데이트
    if (sessionPrice) {
      setSessionPrice(sessionPrice);
    }
    
    // 직접 계산 (훅은 컴포넌트 최상위에서만 호출 가능)
    const originalEnrolledSessions = existingEnrollments.filter(
      (enrollment) => enrollment.isAlreadyEnrolled === true
    );
    
    const originalSessionIds = new Set(originalEnrolledSessions.map(session => session.id));
    
    const newlyAddedSessionsCount = Array.from(sessionIds).filter(
      (sessionId) => !originalSessionIds.has(sessionId)
    ).length;
    
    const newlyCancelledSessionsCount = Array.from(originalSessionIds).filter(
      (sessionId) => !sessionIds.has(sessionId)
    ).length;
    
    const netChange = newlyAddedSessionsCount - newlyCancelledSessionsCount;
    const totalAmount = netChange * actualSessionPrice;
    
    let changeType: "additional_payment" | "refund" | "no_change";
    if (totalAmount > 0) {
      changeType = "additional_payment";
    } else if (totalAmount < 0) {
      changeType = "refund";
    } else {
      changeType = "no_change";
    }
    
    // 실제 변경 사항이 있는지 확인
    const hasChanges = newlyAddedSessionsCount > 0 || newlyCancelledSessionsCount > 0;
    
    if (changeType === "no_change") {
      if (hasChanges) {
        setEnrollmentStep('payment');
      } else {
        setEnrollmentStep('complete');
      }
    } else if (changeType === "additional_payment") {
      setEnrollmentStep('payment');
    } else if (changeType === "refund") {
      setRefundAmount(Math.abs(totalAmount));
      setCancelledSessionsCount(newlyCancelledSessionsCount);
      setEnrollmentStep('refund-request');
    }
  };

  // 환불 신청 완료 시 처리
  const handleRefundComplete = () => {
    // localStorage 정리
    localStorage.removeItem('modificationChangeAmount');
    localStorage.removeItem('modificationChangeType');
    localStorage.removeItem('modificationNetChangeCount');
    localStorage.removeItem('modificationNewSessionsCount');
    localStorage.removeItem('existingEnrollments');
    localStorage.removeItem('selectedSessions');
    localStorage.removeItem('selectedClasses');
    
    setEnrollmentStep('refund-complete');
  };

  // 수강 변경 완료 시 처리
  const handleModificationComplete = () => {
    // localStorage 정리
    localStorage.removeItem('modificationChangeAmount');
    localStorage.removeItem('modificationChangeType');
    localStorage.removeItem('modificationNetChangeCount');
    localStorage.removeItem('modificationNewSessionsCount');
    localStorage.removeItem('existingEnrollments');
    localStorage.removeItem('selectedSessions');
    localStorage.removeItem('selectedClasses');
    
    setEnrollmentStep('refund-complete');
  };

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (effectiveStep) {
      case 'date-selection':
        return (
          <EnrollmentModificationDateStep
            classId={classId}
            existingEnrollments={existingEnrollments}
            month={month}
            onComplete={handleSessionSelectionComplete}
          />
        );
      case 'payment':
        return (
          <EnrollmentModificationPaymentStep
            additionalAmount={change.amount}
            newSessionsCount={change.newSessionsCount}
            onComplete={handleModificationComplete}
          />
        );
      case 'refund-request':
        return (
          <RefundRequestStep
            refundAmount={refundAmount}
            cancelledSessionsCount={cancelledSessionsCount}
            onComplete={handleRefundComplete}
          />
        );
      case 'refund-complete':
        // 환불 신청 완료인지 수강 변경 완료인지 구분
        const isRefundRequest = change.type === 'refund';
        return (
          <RefundCompleteStep
            refundAmount={refundAmount}
            cancelledSessionsCount={cancelledSessionsCount}
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
            onComplete={handleSessionSelectionComplete}
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