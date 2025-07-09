'use client'
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { batchEnrollSessions } from '@/api/class-sessions';
import { toast } from 'react-hot-toast';
import { PaymentToast } from '@/components/features/student/enrollment/month/date/payment/PaymentToast';
import { TeacherPaymentBox } from '@/components/features/student/enrollment/month/date/payment/TeacherPaymentBox';
import { PaymentConfirmFooter } from '@/components/features/student/enrollment/month/date/payment/PaymentConfirmFooter';
import { SelectedSession, TeacherPaymentInfo } from '@/components/features/student/enrollment/month/date/payment/types';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface EnrollmentPaymentStepProps {
  mode?: 'enrollment' | 'modification';
  additionalAmount?: number;
  newSessionsCount?: number;
}

// 결제 페이지 (여러 명의 선생님 지원)
export function EnrollmentPaymentStep({ 
  mode = 'enrollment', 
  additionalAmount = 0, 
  newSessionsCount = 0 
}: EnrollmentPaymentStepProps) {
  const { enrollment, setEnrollmentStep, goBack } = useDashboardNavigation();
  const { selectedSessions: contextSessions } = enrollment;
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentInfo[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 수강 변경 모드에서 사용할 상태
  const [modificationInfo, setModificationInfo] = useState<{
    changeAmount: number;
    changeType: string;
    netChangeCount: number;
    newSessionsCount: number; // 새로 추가된 세션 개수
  } | null>(null);
  
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: mode === 'modification' ? '수강 변경' : '클래스 선택',
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
      label: mode === 'modification' ? '추가 결제' : '결제하기',
      isActive: true,
      isCompleted: false,
    },
  ]

  // 최초 1회만 modificationInfo 세팅
  useEffect(() => {
    if (mode === 'modification' && typeof window !== 'undefined' && modificationInfo === null) {
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
    
    if (sessions.length > 0) {
      setSelectedSessions(sessions);
      
      if (mode === 'modification' && modificationInfo) {
        // 수강 변경 모드: 변경된 금액만 표시
        const teacherMap = new Map<number, TeacherPaymentInfo>();
        
        // 수강 변경 모드에서는 변경된 세션만 계산
        if (modificationInfo.changeType === 'additional_payment' && modificationInfo.netChangeCount > 0) {
          // 추가 결제가 필요한 경우: 새로 추가된 세션만 계산
          const sessionPrice = 50000; // 임시 수강료
          
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
      } else {
        // 일반 수강 신청 모드: 기존 로직
        const teacherMap = new Map<number, TeacherPaymentInfo>();
        
        sessions.forEach(session => {
          const teacherId = session.class?.teacher?.id || 1;
          const teacherName = session.class?.teacher?.name || '선생님';
          
          if (!teacherMap.has(teacherId)) {
            teacherMap.set(teacherId, {
              teacherId,
              teacherName,
              bankName: '신한은행', // 실제로는 선생님 정보에서 가져와야 함
              accountNumber: '110-123-456789',
              accountHolder: teacherName,
              classFees: [],
              totalAmount: 0,
              sessions: [],
            });
          }
          
          const teacher = teacherMap.get(teacherId)!;
          teacher.sessions.push(session);
          
          // 클래스별 수강료 계산 (실제로는 세션별 수강료를 계산해야 함)
          const className = session.class?.className || '클래스';
          const sessionFee = 50000; // 임시 수강료 (실제로는 클래스 정보에서 가져와야 함)
          
          const existingFee = teacher.classFees.find(fee => fee.name === className);
          if (existingFee) {
            existingFee.count += 1;
            existingFee.price += sessionFee;
          } else {
            teacher.classFees.push({
              name: className,
              count: 1,
              price: sessionFee,
            });
          }
          
          teacher.totalAmount += sessionFee;
        });
        
        setTeacherPayments(Array.from(teacherMap.values()));
      }
    }
  }, [contextSessions, mode, modificationInfo]);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  // 결제 완료 버튼 클릭 시
  const handleComplete = async () => {
    if (!confirmed || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 선택된 세션들의 ID를 추출
      const sessionIds = selectedSessions.map(session => session.id);
      
      // 백엔드에 세션별 수강 신청 요청
      const result = await batchEnrollSessions(sessionIds);
      
      if (result.success > 0) {
        toast.success(`${result.success}개 세션의 수강 신청이 완료되었습니다.`);
        setEnrollmentStep('complete');
      } else {
        toast.error('수강 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('수강 신청 중 오류가 발생했습니다.');
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
          {mode === 'modification' && modificationInfo ? (
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
            <>
              <span className="font-bold text-[#595959]">신청 완료 전, 수강료 송금을 마무리 해주세요!</span><br />
              <span className="text-[#595959]">입금이 확인되지 않으면 신청이 취소될 수 있습니다.</span>
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
            {teacherPayments.map((teacher, idx) => (
              <TeacherPaymentBox 
                key={idx} 
                teacher={teacher} 
                onCopy={handleCopy}
                mode={mode}
                modificationInfo={modificationInfo}
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
      
      <PaymentToast show={showToast} message="계좌번호가 복사되었습니다!" />
    </div>
  );
} 