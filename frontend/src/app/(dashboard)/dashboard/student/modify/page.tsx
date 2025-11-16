'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useApp } from '@/contexts';
import { EnrollmentModificationDateStep } from '@/components/dashboard/student/Enrollment/modify/EnrollmentModificationDateStep';
import { EnrollmentModificationPaymentStep } from '@/components/dashboard/student/Enrollment/modify/EnrollmentModificationPaymentStep';
import { EnrollmentCompleteStep } from '@/components/dashboard/student/Enrollment/enroll/EnrollmentCompleteStep';
import { RefundRequestStep } from '@/components/dashboard/student/Enrollment/modify/RefundRequestStep';
import { RefundCompleteStep } from '@/components/dashboard/student/Enrollment/modify/RefundCompleteStep';
import { useStudentEnrollmentHistory } from '@/hooks/queries/student/useStudentEnrollmentHistory';
import type { ModificationSessionVM } from '@/types/view/student';
import { ensureTrailingSlash } from '@/lib/utils/router';

function ModifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const enrollmentId = searchParams.get('id');
  const step = searchParams.get('step') || 'date-step';
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;

  const { form, resetEnrollmentModification } = useApp();
  const { enrollmentModification } = form;
  const { modificationData } = enrollmentModification;

  // React Query 기반 데이터 관리
  const { data: enrollmentHistory = [], isLoading, error } = useStudentEnrollmentHistory();

  // 🛡️ 가드 로직: ID가 없으면 접근 불가
  useEffect(() => {
    if (!enrollmentId) {
      router.replace(ensureTrailingSlash('/dashboard/student'));
      return;
    }
  }, [enrollmentId, router]);

  const classId = enrollmentId ? parseInt(enrollmentId, 10) : 0;

  // 페이지가 마운트될 때 진행상황 초기화
  useEffect(() => {
    resetEnrollmentModification();
  }, [resetEnrollmentModification]);

  // 페이지가 unmount될 때 정리
  useEffect(() => {
    return () => {
      const clearRefundPolicyAgreement = async () => {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        SyncStorage.removeItem('refundPolicyAgreement');
      };
      clearRefundPolicyAgreement();
    };
  }, []);

  // 해당 클래스의 수강 신청 정보 필터링 (ViewModel로 정규화)
  const existingEnrollments: ModificationSessionVM[] = React.useMemo(() => {
    if (!enrollmentHistory || !classId) {
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
      isAlreadyEnrolled: enrollment.status !== 'REJECTED',
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

  // 🛡️ 가드 로직: 순서대로 진행해야 함
  useEffect(() => {
    if (!enrollmentId) return;

    if (step === 'payment' && !modificationData) {
      router.replace(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
    } else if (step === 'refund' && !modificationData) {
      router.replace(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
    } else if (step === 'refund-complete' && !modificationData) {
      router.replace(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
    } else if (step === 'complete' && !modificationData) {
      router.replace(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
    }
  }, [step, router, enrollmentId, modificationData]);

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

  // ID가 없으면 아무것도 렌더링하지 않음 (가드에서 리디렉션됨)
  if (!enrollmentId) {
    return null;
  }

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
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
      if (!modificationData) {
        return null;
      }
      return (
        <EnrollmentModificationPaymentStep
          modificationData={modificationData}
          classId={classId}
        />
      );
    case 'refund':
      if (!modificationData) {
        return null;
      }
      return <RefundRequestStep modificationData={modificationData} />;
    case 'refund-complete':
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
      // 잘못된 스텝 접근 시 첫 단계로 리디렉션
      router.replace(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
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

