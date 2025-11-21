'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts';
import { EnrollmentModificationDateStep } from '@/components/dashboard/student/Enrollment/modify/EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from '@/components/dashboard/student/Enrollment/modify/EnrollmentModificationPaymentStep';
import { RefundRequestStep } from '@/components/dashboard/student/Enrollment/modify/RefundRequestStep';
import { ModificationCompleteStep } from '@/components/dashboard/student/Enrollment/modify/ModificationCompleteStep';
import { useStudentEnrollmentHistory } from '@/hooks/queries/student/useStudentEnrollmentHistory';
import type { ModificationSessionVM } from '@/types/view/student';
import { ensureTrailingSlash } from '@/lib/utils/router';

function ModifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL 파라미터 파싱
  const enrollmentId = searchParams.get('id');
  const step = searchParams.get('step') || 'date-step';
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;

  const { form, resetEnrollmentModification } = useApp();
  const { enrollmentModification } = form;
  const { modificationData } = enrollmentModification;

  // React Query 기반 데이터 관리
  const { data: enrollmentHistory = [], isLoading, error } = useStudentEnrollmentHistory();

  // 🛡️ 가드 로직 1: ID가 없으면 클래스 목록(상위 페이지)으로 리다이렉트
  useEffect(() => {
    if (!enrollmentId) {
      router.replace(ensureTrailingSlash('/dashboard/student/class'));
      return;
    }
  }, [enrollmentId, router]);

  const classId = enrollmentId ? parseInt(enrollmentId, 10) : 0;

  // 초기화 로직
  useEffect(() => {
    // 첫 단계일 때만 초기화 (새로고침 시 데이터 유실 방지 로직과 충돌 주의)
    if (step === 'date-step') {
      resetEnrollmentModification();
    }
  }, [step, resetEnrollmentModification]);

  useEffect(() => {
    return () => {
      const clearRefundPolicyAgreement = async () => {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        SyncStorage.removeItem('refundPolicyAgreement');
      };
      clearRefundPolicyAgreement();
    };
  }, []);

  // 데이터 가공 (ViewModel)
  const existingEnrollments: ModificationSessionVM[] = React.useMemo(() => {
    if (!enrollmentHistory || !classId) return [];

    return enrollmentHistory
      .filter((enrollment) => enrollment.session.class.id === classId)
      .map((enrollment) => ({
        id: enrollment.session.id,
        date: enrollment.session.date,
        startTime: enrollment.session.startTime,
        endTime: enrollment.session.endTime,
        class: enrollment.session.class,
        isAlreadyEnrolled: enrollment.status !== 'REJECTED',
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          description: enrollment.description,
          refundRejection: enrollment.refundRejection,
        },
      }));
  }, [enrollmentHistory, classId]);

  // 🛡️ 가드 로직 2: 유효하지 않은 단계(Step) 접근 시 리다이렉트 (Render 단계 에러 해결)
  useEffect(() => {
    if (!enrollmentId) return;

    const validSteps = [
      'date-step', 
      'payment', 
      'refund', 
      'refund-complete', 
      'payment-complete', 
      'complete'
    ];

    if (!validSteps.includes(step)) {
      router.replace(ensureTrailingSlash(`/dashboard/student/class/modify?id=${enrollmentId}&step=date-step`));
    }
  }, [step, enrollmentId, router]);

  // 🛡️ 가드 로직 3: 데이터가 필요한 단계에 데이터가 없으면 리다이렉트
  useEffect(() => {
    if (!enrollmentId) return;
    const basePath = `/dashboard/student/class/modify?id=${enrollmentId}&step=date-step`;

    const stepsRequiringData = ['payment', 'refund', 'refund-complete', 'payment-complete', 'complete'];
    
    if (stepsRequiringData.includes(step) && !modificationData) {
      router.replace(ensureTrailingSlash(basePath));
    }
  }, [step, router, enrollmentId, modificationData]);

  // 렌더링 로직
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">수강 변경 정보를 불러오는데 실패했습니다.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800">
          다시 시도
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
        <p className="mt-2 text-sm text-gray-600">수강 변경 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!enrollmentId) return null;

  switch (step) {
    case 'date-step':
      return (
        <EnrollmentModificationDateStep
          classId={classId}
          existingEnrollments={existingEnrollments}
          month={month}
        />
      );
    case 'payment':
      if (!modificationData) return null;
      return (
        <EnrollmentModificationPaymentStep
          modificationData={modificationData}
          classId={classId}
        />
      );
    case 'refund':
      if (!modificationData) return null;
      return <RefundRequestStep modificationData={modificationData} />;
    
    case 'refund-complete':
      return (
        <ModificationCompleteStep
          type="refund"
          amount={modificationData?.changeAmount || 0}
        />
      );

    // ✅ [추가] 결제 완료 단계 처리
    case 'payment-complete':
      return (
        <ModificationCompleteStep
          type="payment"
          amount={modificationData?.changeAmount || 0}
        />
      );

    case 'complete':
      return <ModificationCompleteStep type="default" />;
      
    default:
      // 🚀 [수정] default에서는 렌더링만 중단하고, 실제 이동은 useEffect(가드 로직 2)에서 처리
      return null;
  }
}

export default function ModifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    }>
      <ModifyPageContent />
    </Suspense>
  );
}