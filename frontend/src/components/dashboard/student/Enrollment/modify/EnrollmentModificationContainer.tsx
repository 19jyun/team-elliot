'use client';

import React, { useEffect, useState } from 'react';
import { useDashboardNavigation, EnrollmentStep } from '@/contexts/DashboardContext';
import { EnrollmentModificationDateStep } from './EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from './EnrollmentModificationPaymentStep';
import { EnrollmentCompleteStep } from '../enroll/EnrollmentCompleteStep';
import { RefundRequestStep } from './RefundRequestStep';
import { RefundCompleteStep } from './RefundCompleteStep';
import { getStudentClassEnrollments } from '@/api/class-sessions';
import { StudentClassEnrollmentsResponse } from '@/types/api/class';
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation';
import { toast } from 'sonner';

interface EnrollmentModificationContainerProps {
  classId: number;
  className?: string;
  month?: number | null;
}

export function EnrollmentModificationContainer({ classId, className, month }: EnrollmentModificationContainerProps) {
  const { enrollment, setEnrollmentStep } = useDashboardNavigation();
  const { currentStep } = enrollment;
  const [existingEnrollments, setExistingEnrollments] = useState<StudentClassEnrollmentsResponse['sessions']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [refundAmount, setRefundAmount] = useState(0);
  const [cancelledSessionsCount, setCancelledSessionsCount] = useState(0);
  const [sessionPrice, setSessionPrice] = useState(50000); // 기본값

  console.log('EnrollmentModificationContainer 렌더링:', { classId, month, currentStep, className });

  // 수강 변경 모드로 설정 - 즉시 설정
  useEffect(() => {
    console.log('수강 변경 모드로 설정 중...');
    setEnrollmentStep('date-selection');
  }, [setEnrollmentStep]);

  // 수강 변경 모드에서는 항상 date-selection 단계로 강제 설정
  const effectiveStep = currentStep === 'main' ? 'date-selection' : currentStep;
  
  console.log('effectiveStep:', effectiveStep);

  // 기존 수강 신청 정보 로드
  useEffect(() => {
    const loadExistingEnrollments = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentClassEnrollments(classId);
        setExistingEnrollments(response.sessions);
        
        // 기본 수강료 사용 (실제로는 EnrollmentModificationDateStep에서 가져옴)
        setSessionPrice(50000);
      } catch (error) {
        console.error('기존 수강 신청 정보 로드 실패:', error);
        toast.error('수강 변경 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingEnrollments();
  }, [classId]);

  // 수강 변경 금액 계산
  const { change, isAdditionalPayment, isRefund, isNoChange } = useEnrollmentCalculation({
    originalEnrollments: existingEnrollments,
    selectedDates,
    sessionPrice: sessionPrice
  });

  // 날짜 선택 완료 시 처리
  const handleDateSelectionComplete = (dates: string[], sessionPrice?: number) => {
    console.log('handleDateSelectionComplete 호출됨:', dates);
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

    // 새로 선택된 세션 수
    const newSessionsCount = dates.length;

    // 취소될 세션 수 (기존에 신청되었지만 현재 선택되지 않은 세션들)
    const cancelledSessionsCount = originalDates.filter(
      (date) => !dates.includes(date)
    ).length;

    // 순 변경 세션 수
    const netChange = newSessionsCount - originalEnrolledSessions.length;

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
    
    console.log('단계 분기 계산:', {
      dates,
      originalEnrolledSessions: originalEnrolledSessions.length,
      newSessionsCount,
      cancelledSessionsCount,
      netChange,
      totalAmount,
      changeType
    });
    
    if (changeType === "no_change") {
      // 변경 사항이 없으면 완료 페이지로
      console.log('complete 단계로 이동');
      setEnrollmentStep('complete');
    } else if (changeType === "additional_payment") {
      // 추가 결제가 필요하면 결제 페이지로
      console.log('payment 단계로 이동');
      setEnrollmentStep('payment');
    } else if (changeType === "refund") {
      // 환불이 필요하면 환불 신청 페이지로
      console.log('refund-request 단계로 이동');
      setRefundAmount(Math.abs(totalAmount));
      setCancelledSessionsCount(cancelledSessionsCount);
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