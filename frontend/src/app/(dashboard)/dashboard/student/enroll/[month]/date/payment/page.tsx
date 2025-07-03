'use client'
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { StatusStep } from '../../StatusStep';
import { batchEnrollSessions } from '@/api/class-sessions';
import { toast } from 'react-hot-toast';
import { PaymentToast } from './PaymentToast';
import { TeacherPaymentBox } from './TeacherPaymentBox';
import { PaymentConfirmFooter } from './PaymentConfirmFooter';
import { SelectedSession, TeacherPaymentInfo } from './types';

// 결제 페이지 (여러 명의 선생님 지원)
export default function PaymentPage() {
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentInfo[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
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
    if (typeof window !== 'undefined') {
      const sessionsData = localStorage.getItem('selectedSessions');
      console.log('selectedSessions in localStorage:', sessionsData);
      
      if (sessionsData) {
        const sessions: SelectedSession[] = JSON.parse(sessionsData);
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
    }
  }, []);

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
        // 성공 시 대시보드로 이동
        router.push('/dashboard/student');
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
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable]">
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
            수강신청
          </h1>
          <div className="w-10" />
        </div>

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
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col gap-4 w-full max-w-md">
          {teacherPayments.map((teacher, idx) => (
            <TeacherPaymentBox 
              key={idx} 
              teacher={teacher} 
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
      
      <PaymentToast show={showToast} message="계좌번호가 복사되었습니다!" />
      
      <PaymentConfirmFooter 
        confirmed={confirmed} 
        setConfirmed={setConfirmed} 
        onComplete={handleComplete}
        isProcessing={isProcessing}
      />
    </div>
  );
}
