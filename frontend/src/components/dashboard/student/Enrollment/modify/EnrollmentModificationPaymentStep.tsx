'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { PrincipalPaymentBox } from '@/components/features/student/enrollment/month/date/payment/PrincipalPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { SelectedSession, PrincipalPaymentInfo } from '@/components/features/student/enrollment/month/date/payment/types';
import { useBatchModifyEnrollments } from '@/hooks/mutations/student/useBatchModifyEnrollments';
import { useModificationErrorHandler } from '@/hooks/student/useModificationErrorHandler';
import { useClassSessionsForModification } from '@/hooks/queries/student/useClassSessionsForModification';
import { 
  validateModificationData
} from '@/lib/adapters/student';
import type { ModificationSessionVM } from '@/types/view/student';
import { EnrollmentModificationData } from '@/contexts/forms/EnrollmentFormManager';
import type { ClassSessionForModification } from '@/types/api/class';
import { ensureTrailingSlash } from '@/lib/utils/router';

interface EnrollmentModificationPaymentStepProps {
  modificationData: EnrollmentModificationData;
  classId: number;
}

export function EnrollmentModificationPaymentStep({ 
  modificationData,
  classId
}: EnrollmentModificationPaymentStepProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('id') || classId.toString();
  const modifyEnrollmentsMutation = useBatchModifyEnrollments();
  
  // 세션 정보를 다시 가져와서 selectedSessionIds로 필터링
  const { data: modificationSessionsData } = useClassSessionsForModification(classId);
  
  // modificationData.selectedSessionIds를 사용하여 선택된 세션 재구성
  const contextSessions = useMemo(() => {
    if (!modificationSessionsData?.sessions || !modificationData.selectedSessionIds) {
      return [];
    }
    
    const selectedSessionIdsSet = new Set(modificationData.selectedSessionIds);
    const selectedSessions = modificationSessionsData.sessions
      .filter((session: ClassSessionForModification) => selectedSessionIdsSet.has(session.id))
      .map((session: ClassSessionForModification): SelectedSession => ({
        sessionId: session.id,
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        date: session.date,
        isAlreadyEnrolled: session.isAlreadyEnrolled || false,
        isEnrollable: session.isEnrollable || true,
        class: {
          id: session.class?.id || 0,
          className: session.class?.className || 'Unknown Class',
          level: session.class?.level || 'BEGINNER',
          tuitionFee: session.class?.tuitionFee || '0',
          teacher: {
            id: session.class?.teacher?.id || 0,
            name: session.class?.teacher?.name || 'Unknown Teacher',
          },
        },
      }));
    
    return selectedSessions;
  }, [modificationSessionsData?.sessions, modificationData.selectedSessionIds]);
  
  // 에러 핸들러 훅 사용
  // setEnrollmentStep은 useModificationErrorHandler에서 date-selection으로 돌아갈 때만 사용
  const { handleModificationError, handlePartialModificationFailure } = useModificationErrorHandler({
    setEnrollmentStep: (step) => {
      // EnrollmentStep을 EnrollmentModificationStep으로 변환
      if (step === 'date-selection') {
        router.push(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=date-step`));
      }
    },
  });
  const [_selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [principalPayment, setPrincipalPayment] = useState<PrincipalPaymentInfo | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '수강 변경',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '추가 결제',
      isActive: true,
      isCompleted: false,
    },
  ]

  useEffect(() => {
    const loadSessions = async () => {
      // Context에서 수강 변경 데이터 가져오기
      if (!modificationData) {
        console.warn('No modification data found in context');
        return;
      }
      
      if (!contextSessions || contextSessions.length === 0) {
        console.warn('No sessions found in context');
        return;
      }
      
      const sessions = contextSessions;
      setSelectedSessions(sessions);
      
      try {
        const enrollableSession = sessions.find(s => !s.isAlreadyEnrolled) || sessions[0];
        
        if (!enrollableSession) {
          console.warn('결제 정보를 가져올 수 있는 세션이 없습니다.');
          return;
        }
        
        const { getSessionPaymentInfo } = await import('@/api/student');
        const response = await getSessionPaymentInfo(enrollableSession.sessionId || enrollableSession.id);
        const paymentInfo = response.data;
        
        if (paymentInfo && paymentInfo.principal) {
          if (modificationData.changeType === 'additional_payment' && modificationData.netChangeCount > 0) {
            setPrincipalPayment({
              principalId: paymentInfo.principal.id || 0,
              principalName: paymentInfo.principal.name || '원장님',
              bankName: paymentInfo.principal.bankName || '신한은행',
              accountNumber: paymentInfo.principal.accountNumber || '110-123-456789',
              accountHolder: paymentInfo.principal.accountHolder || '김원장',
              classFees: [{
                name: '추가 수강료',
                count: modificationData.newSessionsCount,
                price: modificationData.changeAmount,
              }],
              totalAmount: modificationData.changeAmount,
              sessions: sessions,
            });
          } else if (modificationData.changeType === 'refund' && modificationData.netChangeCount < 0) {
            // 환불 모드: 환불 금액 표시
            setPrincipalPayment({
              principalId: paymentInfo.principal.id || 0,
              principalName: paymentInfo.principal.name || '원장님',
              bankName: paymentInfo.principal.bankName || '신한은행',
              accountNumber: paymentInfo.principal.accountNumber || '110-123-456789',
              accountHolder: paymentInfo.principal.accountHolder || '김원장',
              classFees: [{
                name: '환불 금액',
                count: Math.abs(modificationData.netChangeCount),
                price: Math.abs(modificationData.changeAmount),
              }],
              totalAmount: Math.abs(modificationData.changeAmount),
              sessions: sessions,
            });
          } else if (modificationData.changeType === 'no_change' && modificationData.changeAmount === 0) {
            // netChange = 0이지만 세션 변경이 있는 경우: 0원 결제 표시
            setPrincipalPayment({
              principalId: paymentInfo.principal.id || 0,
              principalName: paymentInfo.principal.name || '원장님',
              bankName: paymentInfo.principal.bankName || '신한은행',
              accountNumber: paymentInfo.principal.accountNumber || '110-123-456789',
              accountHolder: paymentInfo.principal.accountHolder || '김원장',
              classFees: [{
                name: '세션 변경',
                count: modificationData.newSessionsCount + modificationData.cancelledSessionsCount,
                price: 0,
              }],
              totalAmount: 0,
              sessions: sessions,
            });
          }
        }
      } catch (error) {
        console.error('결제 정보 로드 실패:', error);
        toast.error('결제 정보를 불러오는데 실패했습니다.');
      }
    };
    loadSessions();
  }, [contextSessions, modificationData]);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    toast.success('계좌번호가 복사되었습니다!');
  };

  // 결제 완료 버튼 클릭 시
  const handleComplete = async () => {
    if (!confirmed || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Context에서 수강 변경 데이터 가져오기
      if (!modificationData) {
        throw new Error('수강 변경 정보를 찾을 수 없습니다.');
      }

      // modificationData에서 재구성된 세션 정보 사용
      if (!contextSessions || contextSessions.length === 0) {
        throw new Error('선택된 세션 정보를 찾을 수 없습니다.');
      }

      // modificationData에서 originalEnrollments와 selectedSessionIds 사용
      const originalEnrollments = modificationData.originalEnrollments || [];
      const selectedSessionIds = new Set(modificationData.selectedSessionIds || []);

      // 기존 신청 세션의 날짜들
      const originalDates = originalEnrollments
        .filter(enrollment => 
          enrollment.enrollment &&
          (enrollment.enrollment.status === "CONFIRMED" ||
           enrollment.enrollment.status === "PENDING" ||
           enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
        )
        .map(enrollment => new Date(enrollment.date).toISOString().split("T")[0]);

      // 선택된 세션의 날짜들 (contextSessions에서)
      const selectedDates = contextSessions.map(session => 
        new Date(session.date).toISOString().split("T")[0]
      );

      // 취소할 세션 ID 추출 (기존에 있지만 선택되지 않은 세션들)
      const cancellations = originalEnrollments
        .filter(enrollment => {
          const enrollmentDate = new Date(enrollment.date).toISOString().split("T")[0];
          return !selectedDates.includes(enrollmentDate) &&
                 enrollment.enrollment &&
                 (enrollment.enrollment.status === "CONFIRMED" ||
                  enrollment.enrollment.status === "PENDING" ||
                  enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED");
        })
        .map(enrollment => enrollment.enrollment?.id)
        .filter((id): id is number => id !== undefined);

      // 신청할 세션 ID 추출 (새로 선택된 세션들)
      const newEnrollments = Array.from(selectedSessionIds).filter(sessionId => {
        const session = contextSessions.find(s => s.sessionId === sessionId);
        if (!session) return false;
        const sessionDate = new Date(session.date).toISOString().split("T")[0];
        return !originalDates.includes(sessionDate);
      });

      // 수강 변경 데이터 유효성 검증
      const modificationRequest = {
        cancellations,
        newEnrollments,
        reason: '수강 변경'
      };

      if (!validateModificationData(modificationRequest)) {
        throw new Error('수강 변경 데이터가 올바르지 않습니다.');
      }

      console.log('수강 변경 요청 데이터:', modificationRequest);

      // batchModifyEnrollments API 호출
      const result = await modifyEnrollmentsMutation.mutateAsync(modificationRequest);

      // 부분 실패 처리
      if (result && typeof result === 'object' && 'failedOperations' in result && result.failedOperations.length > 0) {
        const selectedSessionsForError = contextSessions as unknown as ModificationSessionVM[];
        const shouldProceed = handlePartialModificationFailure(result, selectedSessionsForError);
        if (shouldProceed.shouldProceed) {
          router.push(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=refund-complete`));
        }
      } else {
        // 완전 성공 (React Query mutation이 성공하면 자동으로 toast 표시)
        router.push(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=refund-complete`));
      }
    } catch (error) {
      const shouldProceed = handleModificationError(error);
      if (!shouldProceed) {
        return; // 에러 발생 시 진행하지 않음
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Pretendard Variable]">
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">

        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center" style={{ color: '#595959' }}>
          {modificationData?.changeType === 'additional_payment' ? (
            <>
              <span className="font-bold text-[#595959]">추가 수강료 송금을 마무리 해주세요!</span><br />
              <span className="text-[#595959]">입금이 확인되지 않으면 변경이 취소될 수 있습니다.</span>
            </>
          ) : (
            <>
              <span className="font-bold text-[#595959]">환불 정보를 확인해주세요!</span><br />
              <span className="text-[#595959]">환불 금액은 영업일 기준 3-5일 내에 입금됩니다.</span>
            </>
          )}
        </div>
      </header>

      {/* Payment Box Container */}
      <main className="flex-1 min-h-0 bg-white">
        <div className="w-full overflow-auto" style={{ 
          height: 'calc(100vh - 450px)',
          minHeight: 0 
        }}>
          <div className="flex flex-col items-center px-4 py-8 gap-6">
            {principalPayment ? (
              <PrincipalPaymentBox 
                principal={principalPayment} 
                onCopy={handleCopy}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-600">결제 정보가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Fixed Footer - 고정 크기 */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200">
        <PaymentConfirmFooter 
          confirmed={confirmed} 
          setConfirmed={setConfirmed} 
          onComplete={handleComplete}
          isProcessing={isProcessing}
        />
      </footer>
    </div>
  );
} 