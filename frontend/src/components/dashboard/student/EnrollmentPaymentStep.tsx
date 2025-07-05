'use client'
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { StatusStep } from '@/app/(dashboard)/dashboard/student/enroll/[month]/StatusStep';
import { batchEnrollSessions } from '@/api/class-sessions';
import { toast } from 'react-hot-toast';
import { PaymentToast } from '@/app/(dashboard)/dashboard/student/enroll/[month]/date/payment/PaymentToast';
import { TeacherPaymentBox } from '@/app/(dashboard)/dashboard/student/enroll/[month]/date/payment/TeacherPaymentBox';
import { PaymentConfirmFooter } from '@/app/(dashboard)/dashboard/student/enroll/[month]/date/payment/PaymentConfirmFooter';
import { SelectedSession, TeacherPaymentInfo } from '@/app/(dashboard)/dashboard/student/enroll/[month]/date/payment/types';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

// 결제 페이지 (여러 명의 선생님 지원)
export function EnrollmentPaymentStep() {
  const { enrollment, setEnrollmentStep, goBack } = useDashboardNavigation();
  const { selectedSessions: contextSessions } = enrollment;
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentInfo[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '클래스 선택',
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
      label: '결제하기',
      isActive: true,
      isCompleted: false,
    },
  ]

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
      
      // 선생님별로 결제 정보 그룹화
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
  }, [contextSessions]);

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
      
      <PaymentToast show={showToast} message="계좌번호가 복사되었습니다!" />
    </div>
  );
} 