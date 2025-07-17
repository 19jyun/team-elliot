'use client'
import React, { useEffect, useState } from 'react';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { TeacherPaymentBox } from '@/components/features/student/enrollment/month/date/payment/TeacherPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { SelectedSession, TeacherPaymentInfo } from '@/components/features/student/enrollment/month/date/payment/types';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { batchModifyEnrollments } from '@/api/class-sessions';

interface EnrollmentModificationPaymentStepProps {
  additionalAmount?: number;
  newSessionsCount?: number;
  onComplete?: () => void;
}

export function EnrollmentModificationPaymentStep({ 
  additionalAmount = 0, 
  newSessionsCount = 0,
  onComplete
}: EnrollmentModificationPaymentStepProps) {
  const { enrollment, setEnrollmentStep, goBack } = useDashboardNavigation();
  const { selectedSessions: contextSessions } = enrollment;
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentInfo[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 수강 변경 모드에서 사용할 상태
  const [modificationInfo, setModificationInfo] = useState<{
    changeAmount: number;
    changeType: string;
    netChangeCount: number;
    newSessionsCount: number;
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
          newSessionsCount: newSessionsCount ? parseInt(newSessionsCount) : 0
        });
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Context에서 세션 정보를 우선 사용하고, 없으면 localStorage에서 가져옴
    let sessions: SelectedSession[] = [];
    
    if (contextSessions && contextSessions.length > 0) {
      sessions = contextSessions;
    } else if (typeof window !== 'undefined') {
      const sessionsData = localStorage.getItem('selectedSessions');
      console.log('selectedSessions in localStorage:', sessionsData);
      
      if (sessionsData) {
        sessions = JSON.parse(sessionsData);
      }
    }
    
    if (sessions.length > 0 && modificationInfo) {
      setSelectedSessions(sessions);
      
      // 수강 변경 모드: 변경된 금액만 표시
      const teacherMap = new Map<number, TeacherPaymentInfo>();
      
      // 수강 변경 모드에서는 변경된 세션만 계산
      if (modificationInfo.changeType === 'additional_payment' && modificationInfo.netChangeCount > 0) {
        // 추가 결제가 필요한 경우: 새로 추가된 세션만 계산
        
        // 새로 추가된 세션들을 찾기 위해 기존 수강 신청 정보와 비교
        const existingEnrollmentsData = localStorage.getItem('existingEnrollments');
        let existingDates: string[] = [];
        
        if (existingEnrollmentsData) {
          const existingEnrollments = JSON.parse(existingEnrollmentsData);
          existingDates = existingEnrollments
            .filter((enrollment: any) => 
              enrollment.enrollment && 
              (enrollment.enrollment.status === "CONFIRMED" || enrollment.enrollment.status === "PENDING")
            )
            .map((enrollment: any) => new Date(enrollment.date).toISOString().split("T")[0]);
        }
        
        // 새로 추가된 세션들만 필터링
        const newSessions = sessions.filter(session => {
          const sessionDate = new Date(session.date).toISOString().split("T")[0];
          return !existingDates.includes(sessionDate);
        });
        
        console.log('수강 변경 - 새로 추가된 세션들:', newSessions);
        console.log('modificationInfo.newSessionsCount:', modificationInfo.newSessionsCount);
        
        // newSessionsCount와 실제 필터링된 세션 수가 일치하는지 확인
        if (newSessions.length === modificationInfo.newSessionsCount) {
          // PaymentBox에는 newSessions만 사용
          newSessions.forEach(session => {
            const teacherId = session.class?.teacher?.id || 1;
            const teacherName = session.class?.teacher?.name || '선생님';
            
            if (!teacherMap.has(teacherId)) {
              teacherMap.set(teacherId, {
                teacherId,
                teacherName,
                bankName: '신한은행',
                accountNumber: '110-123-456789',
                accountHolder: teacherName,
                classFees: [],
                totalAmount: 0,
                sessions: [],
              });
            }
            
            const teacher = teacherMap.get(teacherId)!;
            teacher.sessions.push(session);
            
            const className = session.class?.className || '클래스';
            
            const sessionPrice = parseInt(session.class?.tuitionFee || '50000');
            
            const existingFee = teacher.classFees.find(fee => fee.name === className);
            if (existingFee) {
              existingFee.count += 1;
              existingFee.price += sessionPrice;
            } else {
              teacher.classFees.push({
                name: className,
                count: 1,
                price: sessionPrice,
              });
            }
            
            teacher.totalAmount += sessionPrice;
          });
        } else {
          console.warn('newSessionsCount와 실제 필터링된 세션 수가 일치하지 않습니다:', {
            expected: modificationInfo.newSessionsCount,
            actual: newSessions.length
          });
        }
      }
      
      setTeacherPayments(Array.from(teacherMap.values()));
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

      // 선택된 세션의 날짜들
      const selectedDates = selectedSessions.map(
        (session: any) => new Date(session.date).toISOString().split("T")[0]
      );

      // 취소할 세션들의 enrollment ID
      const cancellations = originalEnrolledSessions
        .filter((enrollment: any) => {
          const enrollmentDate = new Date(enrollment.date).toISOString().split("T")[0];
          return !selectedDates.includes(enrollmentDate);
        })
        .map((enrollment: any) => enrollment.enrollment.id);

      // 새로 신청할 세션들의 session ID
      const newEnrollments = selectedSessions
        .filter((session: any) => {
          const sessionDate = new Date(session.date).toISOString().split("T")[0];
          return !originalDates.includes(sessionDate);
        })
        .map((session: any) => session.id);

      console.log('수강 변경 요청:', {
        cancellations,
        newEnrollments,
        reason: '수강 변경'
      });

      // batchModifyEnrollments API 호출
      const result = await batchModifyEnrollments({
        cancellations,
        newEnrollments,
        reason: '수강 변경'
      });

      console.log('수강 변경 결과:', result);
      toast.success('수강 변경이 완료되었습니다.');
      setEnrollmentStep('complete');
      onComplete?.(); // 수강 변경 완료 시 콜백 호출
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
          {modificationInfo ? (
            <>
              {modificationInfo.changeType === 'additional_payment' ? (
                <span className="font-bold text-[#595959]">추가 결제를 완료해주세요!</span>
              ) : modificationInfo.changeType === 'refund' ? (
                <span className="font-bold text-[#595959]">환불 정보를 입력해주세요!</span>
              ) : (
                <span className="font-bold text-[#595959]">수강 변경을 완료해주세요!</span>
              )}
            </>
          ) : (
            <span className="font-bold text-[#595959]">수강 변경을 완료해주세요!</span>
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
            {teacherPayments.map((teacher, idx) => (
              <TeacherPaymentBox 
                key={idx} 
                teacher={teacher} 
                onCopy={handleCopy}
              />
            ))}
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