'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { useEnrollment } from '@/hooks/student/useEnrollment';
import { useEnrollmentErrorHandler } from '@/hooks/student/useEnrollmentErrorHandler';
import { 
  filterValidSessionsFromContext,
  filterValidSessions, 
  extractSessionIds 
} from '@/lib/adapters/student';
import { PrincipalPaymentBox } from '@/components/features/student/enrollment/month/date/payment/PrincipalPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { useApp } from '@/contexts/AppContext';
import { useStudentEnrollmentPayment } from '@/hooks/queries/student/useStudentEnrollmentPayment';
import type { GetSessionPaymentInfoResponse } from '@/types/api/student';
import type { 
  EnrollmentPaymentStepVM, 
  SelectedSessionVM, 
  PrincipalPaymentInfoVM,
  ClassFeeVM 
} from '@/types/view/student';
import { useRouter } from 'next/navigation';
import { ensureTrailingSlash } from '@/lib/utils/router';

// 새로운 수강신청 플로우 전용 결제 페이지
export function EnrollmentPaymentStep({ onComplete }: EnrollmentPaymentStepVM) {
  const router = useRouter();
  const { form } = useApp();
  const { enrollment } = form;
  const { selectedSessions: contextSessions } = enrollment;
  const { enrollSessions } = useEnrollment();
  const { handlePartialFailure, handleError } = useEnrollmentErrorHandler({ 
    setEnrollmentStep: (step: string) => {
      // 에러 핸들러 호환성을 위한 래퍼
      if (step === 'date-selection') {
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date'));
      } else if (step === 'complete') {
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date/payment/complete'));
      }
    }
  });
  const [selectedSessions, setSelectedSessions] = useState<SelectedSessionVM[]>([]);
  const [principalPayment, setPrincipalPayment] = useState<PrincipalPaymentInfoVM | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 선택된 세션 ID 배열
  const sessionIds = useMemo(() => {
    const validSessions = filterValidSessions(selectedSessions);
    return validSessions.map(session => session.id);
  }, [selectedSessions]);
  
  // React Query를 사용하여 여러 세션의 결제 정보 조회
  const paymentInfoQueries = useStudentEnrollmentPayment(
    sessionIds,
    selectedSessions.length > 0
  );
  
  // 로딩 상태 계산
  const isLoadingPaymentInfo = paymentInfoQueries.some(query => query.isLoading);
  
  // 결제 정보 데이터 추출
  const paymentInfoData = useMemo(() => {
    return paymentInfoQueries.map((query, index) => ({
      session: selectedSessions[index],
      paymentInfo: query.data as GetSessionPaymentInfoResponse | null,
      error: query.error,
    }));
  }, [paymentInfoQueries, selectedSessions]);
  
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '클래스 선택',
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '일자 선택',
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
      isActive: true,
    },
  ]

  // 세션별 결제 정보 로드 - 원장 기준으로 통합
  const loadPaymentInfoForSessions = useCallback((sessions: SelectedSessionVM[]) => {
    try {
      // 어댑터를 사용하여 유효한 세션만 필터링
      const validSessions = filterValidSessions(sessions);
      
      if (validSessions.length === 0) {
        console.error('유효한 세션 ID가 없습니다:', sessions);
        toast.error('선택한 세션 정보가 올바르지 않습니다. 다시 선택해주세요.');
        router.replace(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date'));
        return;
      }
      
      // React Query hook이 자동으로 데이터를 가져오므로, 
      // 여기서는 paymentInfoData를 사용하여 결제 정보 처리
      if (isLoadingPaymentInfo) {
        return; // 아직 로딩 중
      }
      
      let principalInfo: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
      } | null = null;
      const classFees: ClassFeeVM[] = [];
      let totalAmount = 0;
      
      // paymentInfoData를 사용하여 결제 정보 처리
      for (const { session, paymentInfo } of paymentInfoData) {
        if (paymentInfo && paymentInfo.principal) {
          // 원장 정보는 첫 번째 세션에서 가져옴 (모든 세션이 같은 원장)
          if (!principalInfo) {
            principalInfo = paymentInfo.principal;
          }
          
          // 실제 클래스의 tuitionFee를 사용하여 수강료 계산
          const className = session.class?.className || '클래스';
          const sessionFee = Number(paymentInfo.tuitionFee) || 0;
        
          // 클래스 수강료 정보 추가
          const existingFee = classFees.find(fee => fee.name === className);
          if (existingFee) {
            existingFee.count += 1;
            existingFee.price += sessionFee;
          } else {
            classFees.push({
              name: className,
              count: 1,
              price: sessionFee,
            });
          }
          
          totalAmount += sessionFee;
        } else {
          // 에러가 발생한 경우 기본값 사용
          if (!principalInfo) {
            principalInfo = {
              bankName: '은행 정보 로드 실패',
              accountNumber: '계좌번호 로드 실패',
              accountHolder: '계좌주 로드 실패',
            };
          }
          
          const className = session.class?.className || '클래스';
          const sessionFee = Number(session.class?.tuitionFee) || 0;
          
          const existingFee = classFees.find(fee => fee.name === className);
          if (existingFee) {
            existingFee.count += 1;
            existingFee.price += sessionFee;
          } else {
            classFees.push({
              name: className,
              count: 1,
              price: sessionFee,
            });
          }
          
          totalAmount += sessionFee;
        }
      }
      
      // 원장 기준으로 통합된 결제 정보 설정
      if (principalInfo) {
        setPrincipalPayment({
          principalId: 0, // 원장 ID (사용하지 않음)
          principalName: '원장님', // 원장으로 표시
          bankName: principalInfo.bankName || '은행 정보 없음',
          accountNumber: principalInfo.accountNumber || '계좌번호 없음',
          accountHolder: principalInfo.accountHolder || '계좌주 없음',
          classFees,
          totalAmount: Number(totalAmount), // 확실히 숫자로 변환
          sessions: validSessions,
        });
      }
    } catch (error) {
      console.error('결제 정보 처리 실패:', error);
      toast.error('결제 정보를 처리하는데 실패했습니다.');
    }
  }, [router, paymentInfoData, isLoadingPaymentInfo]);
  
  // 이전 paymentInfoData와 selectedSessions를 추적하여 무한 루프 방지
  const prevPaymentInfoDataRef = React.useRef<string>('');
  const prevSelectedSessionsRef = React.useRef<string>('');
  
  // selectedSessions 또는 paymentInfoData가 변경되면 자동으로 결제 정보 업데이트
  useEffect(() => {
    // selectedSessions가 없으면 실행하지 않음
    if (selectedSessions.length === 0) {
      return;
    }

    // selectedSessions ID 배열을 문자열로 변환하여 비교
    const currentSelectedSessionsKey = selectedSessions.map(s => s.id).sort().join(',');
    
    // paymentInfoData를 문자열로 변환하여 비교 (깊은 비교 대신)
    const currentPaymentInfoKey = JSON.stringify(paymentInfoData.map(({ session, paymentInfo }) => ({
      sessionId: session.id,
      paymentInfo: paymentInfo ? {
        tuitionFee: paymentInfo.tuitionFee,
        principal: paymentInfo.principal ? {
          bankName: paymentInfo.principal.bankName,
          accountNumber: paymentInfo.principal.accountNumber,
        } : null,
      } : null,
    })));
    
    // 이전 값들과 동일하면 실행하지 않음
    if (
      prevSelectedSessionsRef.current === currentSelectedSessionsKey &&
      prevPaymentInfoDataRef.current === currentPaymentInfoKey
    ) {
      return;
    }
    
    // 로딩 중이 아니고 paymentInfoData가 있을 때만 실행
    if (!isLoadingPaymentInfo && paymentInfoData.length > 0) {
      prevSelectedSessionsRef.current = currentSelectedSessionsKey;
      prevPaymentInfoDataRef.current = currentPaymentInfoKey;
      loadPaymentInfoForSessions(selectedSessions);
    }
  }, [selectedSessions, paymentInfoData, isLoadingPaymentInfo, loadPaymentInfoForSessions]);

  // 세션 로드 여부를 추적하여 중복 실행 방지
  const hasLoadedSessionsRef = React.useRef(false);

  useEffect(() => {
    // 이미 로드했으면 실행하지 않음
    if (hasLoadedSessionsRef.current) {
      return;
    }

    // selectedSessions가 이미 있으면 로드할 필요 없음
    if (selectedSessions.length > 0) {
      hasLoadedSessionsRef.current = true;
      return;
    }

    const loadSessions = async () => {
      // Context에서 세션 정보를 우선 사용하고, 없으면 localStorage에서 가져옴
      let sessions: SelectedSessionVM[] = [];
      
      if (contextSessions && contextSessions.length > 0) {
        // 어댑터를 사용하여 ExtendedSessionData를 SelectedSessionVM으로 변환하고 유효성 검증
        sessions = filterValidSessionsFromContext(contextSessions);

      } else if (typeof window !== 'undefined') {
        const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
        const sessionsData = SyncStorage.getItem('selectedSessions');
      
      if (sessionsData) {
        sessions = JSON.parse(sessionsData);

      }
    }
    

    
    if (sessions.length > 0) {
      // 어댑터를 사용하여 유효한 세션만 필터링
      const validSessions = filterValidSessions(sessions);
      
      if (validSessions.length === 0) {
        console.error('유효한 세션 ID가 없습니다:', sessions);
        toast.error('선택한 세션 정보가 올바르지 않습니다. 다시 선택해주세요.');
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date'));
        return;
      }
      
      // 이미 수강 신청한 세션이 있는지 확인
      const alreadyEnrolledSessions = validSessions.filter(session => 
        session.isAlreadyEnrolled || !session.isEnrollable
      );
      
      if (alreadyEnrolledSessions.length > 0) {
        toast.error('이미 수강 신청한 세션이 포함되어 있습니다. 다시 선택해주세요.');
        // 이전 단계로 돌아가기
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date'));
        return;
      }
      
      // 세션 ID 배열을 비교하여 실제로 변경된 경우에만 setState 호출
      const currentSessionIds = selectedSessions.map(s => s.id).sort().join(',');
      const newSessionIds = validSessions.map(s => s.id).sort().join(',');
      
      if (currentSessionIds !== newSessionIds) {
        setSelectedSessions(validSessions);
        hasLoadedSessionsRef.current = true;
        // loadPaymentInfoForSessions는 첫 번째 useEffect에서 selectedSessions 변경 시 자동으로 호출됨
      }
    } else {
      console.warn('🔍 세션 데이터가 없습니다!');
    }
    };
    loadSessions();
  }, [contextSessions, router, selectedSessions]);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    toast.success('계좌번호가 복사되었습니다!');
  };

  // 결제 완료 버튼 클릭 시
  const handleComplete = async () => {
    if (!confirmed || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 어댑터를 사용하여 유효한 세션만 필터링
      const validSessions = filterValidSessions(selectedSessions);
      
      if (validSessions.length === 0) {
        toast.error('선택한 세션 정보가 올바르지 않습니다. 다시 선택해주세요.');
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date'));
        return;
      }
      
      // 새로운 수강 신청 모드: 실제 세션 데이터 기반
      const sessionIds = extractSessionIds(validSessions);
      
      // 백엔드에 세션별 수강 신청 요청 (낙관적 업데이트 포함)
      const result = await enrollSessions(sessionIds, validSessions);
      
      // 부분 실패 처리
      if (result && typeof result === 'object' && 'failedSessions' in result) {
        const shouldProceed = handlePartialFailure(result, validSessions);
        if (shouldProceed.shouldProceed) {
          router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date/payment/complete'));
          onComplete?.();
        }
      } else {
        // 기존 방식 (성공으로 간주)
        toast.success('수강신청이 완료되었습니다!', {
          description: '승인 대기 중입니다.',
        });
        router.push(ensureTrailingSlash('/dashboard/student/enroll/academy/class/date/payment/complete'));
        onComplete?.();
      }
    } catch (error) {
      const shouldProceed = handleError(error);
      if (!shouldProceed) {
        return; // 에러 발생 시 진행하지 않음
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Pretendard Variable]">
      {/* Header - 자동 크기 조정 */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 relative">
        <div className="flex gap-6 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[320px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center px-4" style={{ color: '#595959' }}>
          <span className="font-bold text-[#595959]">신청 완료 전, 수강료 송금을 마무리 해주세요!</span><br />
          <span className="text-[#595959]">입금이 확인되지 않으면 신청이 취소될 수 있습니다.</span>
        </div>
      </header>

      {/* Main Content - Flex를 사용한 자동 높이 조정 */}
      <main className="flex-1 min-h-0 overflow-y-auto bg-white">
        <div className="flex flex-col items-center px-4 py-8 gap-6 min-h-full">
          {isLoadingPaymentInfo ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700 mb-4" />
              <p className="text-gray-600">결제 정보를 불러오는 중...</p>
            </div>
          ) : principalPayment ? (
            <PrincipalPaymentBox 
              principal={principalPayment} 
              onCopy={handleCopy}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-gray-600">결제 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer - 자동 크기 조정 */}
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