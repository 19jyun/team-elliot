'use client'
import React, { useEffect, useState } from 'react';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { PrincipalPaymentBox } from '@/components/features/student/enrollment/month/date/payment/PrincipalPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { SelectedSession, PrincipalPaymentInfo } from '@/components/features/student/enrollment/month/date/payment/types';
import { useApp } from '@/contexts/AppContext';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { useModificationErrorHandler } from '@/hooks/student/useModificationErrorHandler';
import { 
  filterValidModificationSessions,
  validateModificationData
} from '@/lib/adapters/student';
import type { ModificationSessionVM } from '@/types/view/student';

interface EnrollmentModificationPaymentStepProps {
  additionalAmount?: number;
  newSessionsCount?: number;
  onComplete?: () => void;
}

export function EnrollmentModificationPaymentStep({ 
  onComplete
}: EnrollmentModificationPaymentStepProps) {
  const { form, setEnrollmentStep } = useApp();
  const { enrollment } = form;
  const { selectedSessions: contextSessions } = enrollment;
  const { modifyEnrollments } = useStudentApi();
  
  // 에러 핸들러 훅 사용
  const { handleModificationError, handlePartialModificationFailure } = useModificationErrorHandler({
    setEnrollmentStep,
  });
  const [_selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [principalPayment, setPrincipalPayment] = useState<PrincipalPaymentInfo | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 수강 변경 모드에서 사용할 상태
  const [modificationInfo, setModificationInfo] = useState<{
    changeAmount: number;
    changeType: string;
    netChangeCount: number;
    newSessionsCount: number;
    cancelledSessionsCount: number;
  } | null>(null);
  
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

  // 최초 1회만 modificationInfo 세팅
  useEffect(() => {
    if (typeof window !== 'undefined' && modificationInfo === null) {
      const changeAmount = localStorage.getItem('modificationChangeAmount');
      const changeType = localStorage.getItem('modificationChangeType');
      const netChangeCount = localStorage.getItem('modificationNetChangeCount');
      const newSessionsCount = localStorage.getItem('modificationNewSessionsCount');
      
      if (changeAmount && changeType && netChangeCount) {
        setModificationInfo({
          changeAmount: parseInt(changeAmount),
          changeType,
          netChangeCount: parseInt(netChangeCount),
          newSessionsCount: newSessionsCount ? parseInt(newSessionsCount) : 0,
          cancelledSessionsCount: 0 // 기본값 설정
        });
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Context에서 세션 정보를 우선 사용하고, 없으면 localStorage에서 가져옴
    let sessions: SelectedSession[] = [];
    
    if (contextSessions && contextSessions.length > 0) {
      sessions = contextSessions as unknown as SelectedSession[];
    } else if (typeof window !== 'undefined') {
      const sessionsData = localStorage.getItem('selectedSessions');
      
      if (sessionsData) {
        sessions = JSON.parse(sessionsData);
      }
    }
    
    if (sessions.length > 0 && modificationInfo) {
      setSelectedSessions(sessions);
      
      // 수강 변경 모드: 원장 기준으로 통합된 결제 정보
      if (modificationInfo.changeType === 'additional_payment' && modificationInfo.netChangeCount > 0) {
        // 추가 결제 모드: 변경된 금액만 표시
        setPrincipalPayment({
          principalId: 0,
          principalName: '원장님',
          bankName: '신한은행', // 기본값 (실제로는 API에서 가져와야 함)
          accountNumber: '110-123-456789',
          accountHolder: '김원장',
          classFees: [{
            name: '추가 수강료',
            count: modificationInfo.newSessionsCount,
            price: modificationInfo.changeAmount,
          }],
          totalAmount: modificationInfo.changeAmount,
          sessions: sessions,
        });
      } else if (modificationInfo.changeType === 'refund' && modificationInfo.netChangeCount < 0) {
        // 환불 모드: 환불 금액 표시
        setPrincipalPayment({
          principalId: 0,
          principalName: '원장님',
          bankName: '신한은행', // 기본값
          accountNumber: '110-123-456789',
          accountHolder: '김원장',
          classFees: [{
            name: '환불 금액',
            count: Math.abs(modificationInfo.netChangeCount),
            price: Math.abs(modificationInfo.changeAmount),
          }],
          totalAmount: Math.abs(modificationInfo.changeAmount),
          sessions: sessions,
        });
      } else if (modificationInfo.changeType === 'no_change' && modificationInfo.changeAmount === 0) {
        // netChange = 0이지만 세션 변경이 있는 경우: 0원 결제 표시
        setPrincipalPayment({
          principalId: 0,
          principalName: '원장님',
          bankName: '신한은행', // 기본값
          accountNumber: '110-123-456789',
          accountHolder: '김원장',
          classFees: [{
            name: '세션 변경',
            count: modificationInfo.newSessionsCount + modificationInfo.cancelledSessionsCount,
            price: 0,
          }],
          totalAmount: 0,
          sessions: sessions,
        });
      }
    }
  }, [contextSessions, modificationInfo]);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    toast.success('계좌번호가 복사되었습니다!');
  };

  // 결제 완료 버튼 클릭 시
  const handleComplete = async () => {
    if (!confirmed || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 수강 변경 모드: batchModifyEnrollments API 호출
      const existingEnrollmentsData = localStorage.getItem('existingEnrollments');
      const selectedSessionsData = localStorage.getItem('selectedSessions');
      
      if (!existingEnrollmentsData || !selectedSessionsData) {
        throw new Error('수강 변경 정보를 찾을 수 없습니다.');
      }

      const existingEnrollments = JSON.parse(existingEnrollmentsData);
      const selectedSessions = JSON.parse(selectedSessionsData);

      // 어댑터를 사용하여 유효한 세션만 필터링
      const validExistingEnrollments = filterValidModificationSessions(existingEnrollments);
      const validSelectedSessions = filterValidModificationSessions(selectedSessions);
      
      if (validExistingEnrollments.length === 0 && validSelectedSessions.length === 0) {
        throw new Error('유효한 세션 정보가 없습니다.');
      }

      // 기존에 신청된 세션들 (활성 상태)
      const originalEnrolledSessions = validExistingEnrollments.filter(
        (enrollment: ModificationSessionVM) =>
          enrollment.enrollment &&
          (enrollment.enrollment.status === "CONFIRMED" ||
            enrollment.enrollment.status === "PENDING" ||
            enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
      );

      // 기존 신청 세션의 날짜들
      const originalDates = originalEnrolledSessions.map(
        (enrollment: ModificationSessionVM) => new Date(enrollment.date).toISOString().split("T")[0]
      );

      // 선택된 세션의 날짜들
      const selectedDates = validSelectedSessions.map(
        (session: ModificationSessionVM) => new Date(session.date).toISOString().split("T")[0]
      );

      // 어댑터를 사용하여 취소할 세션 ID 추출
      const cancellations = originalEnrolledSessions
        .filter((enrollment: ModificationSessionVM) => {
          const enrollmentDate = new Date(enrollment.date).toISOString().split("T")[0];
          return !selectedDates.includes(enrollmentDate);
        })
        .map((enrollment: ModificationSessionVM) => enrollment.enrollment?.id)
        .filter((id): id is number => id !== undefined);

      // 어댑터를 사용하여 신청할 세션 ID 추출
      const newEnrollments = validSelectedSessions
        .filter((session: ModificationSessionVM) => {
          const sessionDate = new Date(session.date).toISOString().split("T")[0];
          return !originalDates.includes(sessionDate);
        })
        .map((session: ModificationSessionVM) => session.id);

      // 수강 변경 데이터 유효성 검증
      const modificationData = {
        cancellations,
        newEnrollments,
        reason: '수강 변경'
      };

      if (!validateModificationData(modificationData)) {
        throw new Error('수강 변경 데이터가 올바르지 않습니다.');
      }

      console.log('수강 변경 요청 데이터:', modificationData);

      // batchModifyEnrollments API 호출
      const result = await modifyEnrollments(modificationData);

      // 부분 실패 처리
      if (result && result.data && typeof result.data === 'object' && 'failedOperations' in result.data) {
        const shouldProceed = handlePartialModificationFailure(result.data, validSelectedSessions);
        if (shouldProceed.shouldProceed) {
          setEnrollmentStep('complete');
          onComplete?.();
        }
      } else {
        // 완전 성공
        toast.success('수강 변경이 완료되었습니다.');
        setEnrollmentStep('complete');
        onComplete?.();
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
          {modificationInfo?.changeType === 'additional_payment' ? (
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