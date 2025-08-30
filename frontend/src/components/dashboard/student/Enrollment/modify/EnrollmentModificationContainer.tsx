'use client';

import React, { useEffect, useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { EnrollmentModificationDateStep } from './EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from './EnrollmentModificationPaymentStep';
import { EnrollmentCompleteStep } from '../enroll/EnrollmentCompleteStep';
import { RefundRequestStep } from './RefundRequestStep';
import { RefundCompleteStep } from './RefundCompleteStep';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation';


interface EnrollmentModificationContainerProps {
  classId: number;
  className?: string;
  month?: number | null;
}

export function EnrollmentModificationContainer({ classId, month }: EnrollmentModificationContainerProps) {
  const { enrollment, setEnrollmentStep } = useDashboardNavigation();
  const { currentStep } = enrollment;
  const { enrollmentHistory, isLoading, error, loadEnrollmentHistory } = useStudentApi();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
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
  const effectiveStep = currentStep === 'main' ? 'date-selection' : currentStep;
  

  // Redux에서 해당 클래스의 수강 신청 정보 필터링
  const existingEnrollments = React.useMemo(() => {
    if (!enrollmentHistory) {
      return [];
    }
    
    const filtered = enrollmentHistory.filter(enrollment => 
      enrollment.session.class.id === classId
    );
    
    return filtered.map(enrollment => ({
      id: enrollment.session.id,
      date: enrollment.session.date,
      startTime: enrollment.session.startTime,
      endTime: enrollment.session.endTime,
      class: enrollment.session.class,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status as any, // 타입 호환성을 위해 any로 캐스팅
        enrolledAt: enrollment.enrolledAt,
        description: enrollment.description,
        refundRejection: enrollment.refundRejection
      }
    }));
  }, [enrollmentHistory, classId]);

  // 수강 변경 금액 계산
  const { change } = useEnrollmentCalculation({
    originalEnrollments: existingEnrollments,
    selectedDates,
    sessionPrice: sessionPrice
  });

  // 날짜 선택 완료 시 처리
  const handleDateSelectionComplete = (dates: string[], sessionPrice?: number) => {
    setSelectedDates(dates);
    
    // 전달받은 sessionPrice가 있으면 사용, 없으면 기존 값 사용
    const actualSessionPrice = sessionPrice || 50000;
    
    // sessionPrice 상태 업데이트
    if (sessionPrice) {
      setSessionPrice(sessionPrice);
    }
    
    // 즉시 단계 분기 처리 - useEnrollmentCalculation 로직을 직접 구현
    // 실제 sessionPrice 사용
    
    // 기존에 신청된 세션들 (활성 상태)
    const originalEnrolledSessions = existingEnrollments.filter(
      (enrollment: any) =>
        enrollment.enrollment &&
        (enrollment.enrollment.status === "CONFIRMED" ||
          enrollment.enrollment.status === "PENDING" ||
          enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
    );

    // 기존 신청 세션의 날짜들
    const originalDates = originalEnrolledSessions.map(
      (enrollment: any) => new Date(enrollment.date).toISOString().split("T")[0]
    );

    // 새로 추가될 세션 수 (기존에 없던 세션들)
    const newlyAddedSessionsCount = dates.filter(
      date => !originalDates.includes(date)
    ).length;

    // 새로 취소될 세션 수 (기존에 있던 세션들)
    const newlyCancelledSessionsCount = originalDates.filter(
      date => !dates.includes(date)
    ).length;

    // 순 변경 세션 수 = 새로 추가 - 새로 취소
    const netChange = newlyAddedSessionsCount - newlyCancelledSessionsCount;

    // 총 금액 계산
    const totalAmount = netChange * actualSessionPrice;

    // 변경 타입 결정
    let changeType: "additional_payment" | "refund" | "no_change";
    if (totalAmount > 0) {
      changeType = "additional_payment";
    } else if (totalAmount < 0) {
      changeType = "refund";
    } else {
      changeType = "no_change";
    }
    
    // 변경 정보 로깅
    console.log('수강 변경 정보:', {
      dates,
      originalEnrolledSessions: originalEnrolledSessions.length,
      newlyAddedSessionsCount,
      newlyCancelledSessionsCount,
      netChange,
      totalAmount,
      changeType
    });
    
    // 실제 변경 사항이 있는지 확인
    const hasChanges = newlyAddedSessionsCount > 0 || newlyCancelledSessionsCount > 0;
    
    if (changeType === "no_change") {
      if (hasChanges) {
        setEnrollmentStep('payment');
      } else {
        setEnrollmentStep('complete');
      }
    } else if (changeType === "additional_payment") {
      // 추가 결제가 필요하면 결제 페이지로
      setEnrollmentStep('payment');
    } else if (changeType === "refund") {
      // 환불이 필요하면 환불 신청 페이지로
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
            onComplete={handleDateSelectionComplete}
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
            onComplete={handleDateSelectionComplete}
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