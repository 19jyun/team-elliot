'use client'
import React, { useEffect, useState } from 'react';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { PrincipalPaymentBox } from '@/components/features/student/enrollment/month/date/payment/PrincipalPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { SelectedSession, PrincipalPaymentInfo } from '@/components/features/student/enrollment/month/date/payment/types';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface EnrollmentPaymentStepProps {
  onComplete?: () => void;
}

// 새로운 수강신청 플로우 전용 결제 페이지
export function EnrollmentPaymentStep({ onComplete }: EnrollmentPaymentStepProps) {
  const { enrollment, setEnrollmentStep } = useDashboardNavigation();
  const { selectedSessions: contextSessions } = enrollment;
  const { enrollSessions, loadSessionPaymentInfo } = useStudentApi();
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [principalPayment, setPrincipalPayment] = useState<PrincipalPaymentInfo | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(false);
  
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '클래스 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '일자 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
      isActive: true,
      isCompleted: false,
    },
  ]

  // 세션별 결제 정보 로드 - 원장 기준으로 통합
  const loadPaymentInfoForSessions = async (sessions: SelectedSession[]) => {
    setIsLoadingPaymentInfo(true);
    
    try {
      let principalInfo: any = null;
      const classFees: any[] = [];
      let totalAmount = 0;
      
      // 각 세션별로 결제 정보를 가져옴
      for (const session of sessions) {
        try {
          const paymentInfo = await loadSessionPaymentInfo(session.id);
          
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
          }
        } catch (error) {
          console.error(`세션 ${session.id}의 결제 정보 로드 실패:`, error);
          // 에러가 발생한 경우 기본값 사용
          if (!principalInfo) {
            principalInfo = {
              bankName: '은행 정보 로드 실패',
              accountNumber: '계좌번호 로드 실패',
              accountHolder: '계좌주 로드 실패',
            };
          }
          
          const className = session.class?.className || '클래스';
          const sessionFee = Number((session.class as any)?.tuitionFee) || 0;
          
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
          sessions,
        });
      }
    } catch (error) {
      console.error('결제 정보 로드 실패:', error);
      toast.error('결제 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingPaymentInfo(false);
    }
  };

  useEffect(() => {
    // Context에서 세션 정보를 우선 사용하고, 없으면 localStorage에서 가져옴
    let sessions: SelectedSession[] = [];
    
    if (contextSessions && contextSessions.length > 0) {
      sessions = contextSessions;
    } else if (typeof window !== 'undefined') {
      const sessionsData = localStorage.getItem('selectedSessions');
      
      if (sessionsData) {
        sessions = JSON.parse(sessionsData);
      }
    }
    
    if (sessions.length > 0) {
      // 이미 수강 신청한 세션이 있는지 확인
      const alreadyEnrolledSessions = sessions.filter(session => 
        session.isAlreadyEnrolled || !session.isEnrollable
      );
      
      if (alreadyEnrolledSessions.length > 0) {
        toast.error('이미 수강 신청한 세션이 포함되어 있습니다. 다시 선택해주세요.');
        // 이전 단계로 돌아가기
        setEnrollmentStep('date-selection');
        return;
      }
      
      setSelectedSessions(sessions);
      // 실제 결제 정보 로드
      loadPaymentInfoForSessions(sessions);
    }
  }, [contextSessions, loadSessionPaymentInfo, setEnrollmentStep]);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    toast.success('계좌번호가 복사되었습니다!');
  };

  // 결제 완료 버튼 클릭 시
  const handleComplete = async () => {
    if (!confirmed || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 새로운 수강 신청 모드: 기존 로직
      const sessionIds = selectedSessions.map(session => session.id);
      
      // 백엔드에 세션별 수강 신청 요청
      const result = await enrollSessions(sessionIds);
      
      if (result.success > 0) {
        toast.success(`${result.success}개 세션의 수강 신청이 완료되었습니다.`);
        setEnrollmentStep('complete');
        onComplete?.();
      } else {
        toast.error('수강 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
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
          <span className="font-bold text-[#595959]">신청 완료 전, 수강료 송금을 마무리 해주세요!</span><br />
          <span className="text-[#595959]">입금이 확인되지 않으면 신청이 취소될 수 있습니다.</span>
        </div>
      </header>

      {/* Payment Box Container */}
      <main className="flex-1 min-h-0 bg-white">
        <div className="w-full overflow-auto" style={{ 
          height: 'calc(100vh - 450px)',
          minHeight: 0 
        }}>
          <div className="flex flex-col items-center px-4 py-8 gap-6">
            {isLoadingPaymentInfo ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700 mb-4" />
                <p className="text-gray-600">결제 정보를 불러오는 중...</p>
              </div>
            ) : principalPayment ? (
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