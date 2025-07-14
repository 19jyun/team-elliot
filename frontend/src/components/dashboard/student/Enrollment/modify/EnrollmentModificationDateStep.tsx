'use client'
import * as React from 'react'
import Calendar from '@/components/features/student/enrollment/month/date/Calendar'
import DateSelectFooter from '@/components/features/student/enrollment/month/date/DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation'

interface EnrollmentModificationDateStepProps {
  classId: number;
  existingEnrollments: any[];
  month?: number | null;
  onComplete: (selectedDates: string[]) => void;
}

export function EnrollmentModificationDateStep({ 
  classId, 
  existingEnrollments, 
  month, 
  onComplete 
}: EnrollmentModificationDateStepProps) {
  const { setSelectedSessions } = useDashboardNavigation()
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectableCount, setSelectableCount] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  // 수강 변경 모드로 특정 클래스만 선택된 것으로 처리
  React.useEffect(() => {
    const selectedClassCards = [{
      id: classId,
      // Calendar 컴포넌트에서 실제 클래스 정보를 로드할 때 사용
    }];
    localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
  }, [classId]);
    
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '수강 변경',
      isActive: false,
      isCompleted: true, // 완료된 단계
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isActive: true,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '변경 확인',
      isActive: false,
      isCompleted: false,
    },
  ]

  // 전체선택/해제 핸들러
  const handleSelectAll = () => {
    setIsAllSelected(true)
  }

  const handleDeselectAll = () => {
    setIsAllSelected(false)
  }

  // 선택된 개수와 선택 가능한 개수를 비교하여 전체선택 상태 결정
  React.useEffect(() => {
    if (selectableCount > 0 && selectedCount === selectableCount) {
      setIsAllSelected(true)
    } else {
      setIsAllSelected(false)
    }
  }, [selectedCount, selectableCount])

  // 선택된 날짜들을 배열로 변환
  React.useEffect(() => {
    if (selectedClasses.length > 0) {
      const dates = selectedClasses.flatMap(classInfo => 
        classInfo.sessions?.map((session: any) => 
          new Date(session.date).toISOString().split('T')[0]
        ) || []
      );
      setSelectedDates([...new Set(dates)]); // 중복 제거
    }
  }, [selectedClasses]);

  // 수강 변경 모드에서 금액 계산
  const { change } = useEnrollmentCalculation({
    originalEnrollments: existingEnrollments || [],
    selectedDates,
    sessionPrice: 50000 // 임시로 5만원으로 설정
  });

  // 변경된 강의 개수 계산
  const netChangeCount = React.useMemo(() => {
    if (!existingEnrollments) return 0;
    
    // 기존에 신청된 세션들 (CONFIRMED 또는 PENDING 상태)
    const originalEnrolledSessions = existingEnrollments.filter(
      (enrollment: any) =>
        enrollment.enrollment &&
        (enrollment.enrollment.status === "CONFIRMED" ||
          enrollment.enrollment.status === "PENDING")
    );

    // 기존 신청 세션의 날짜들
    const originalDates = originalEnrolledSessions.map(
      (enrollment: any) => new Date(enrollment.date).toISOString().split("T")[0]
    );

    // 새로 선택된 세션 수
    const newSessionsCount = selectedDates.length;

    // 취소될 세션 수 (기존에 신청되었지만 현재 선택되지 않은 세션들)
    const cancelledSessionsCount = originalDates.filter(
      (date) => !selectedDates.includes(date)
    ).length;

    // 순 변경 세션 수 = 새로 선택된 세션 - 기존 신청 세션
    const netChange = newSessionsCount - originalEnrolledSessions.length;
    
    console.log('수강 변경 계산:', {
      originalEnrolledSessions: originalEnrolledSessions.length,
      originalDates,
      selectedDates,
      newSessionsCount,
      cancelledSessionsCount,
      netChange
    });
    
    return netChange;
  }, [existingEnrollments, selectedDates]);

  // 수강 변경 완료 처리
  const handleModificationComplete = () => {
    if (typeof window !== 'undefined') {
      // 수강 변경 모드: 변경된 금액만 저장
      const changeAmount = Math.abs(change.amount);
      const changeType = change.type;
      
      // 기존에 신청된 세션들 (CONFIRMED 또는 PENDING 상태)
      const originalEnrolledSessions = existingEnrollments?.filter(
        (enrollment: any) =>
          enrollment.enrollment &&
          (enrollment.enrollment.status === "CONFIRMED" ||
            enrollment.enrollment.status === "PENDING")
      ) || [];

      // 기존 신청 세션의 날짜들
      const originalDates = originalEnrolledSessions.map(
        (enrollment: any) => new Date(enrollment.date).toISOString().split("T")[0]
      );

      // 새로 선택된 세션 수 (기존에 신청되지 않은 세션들)
      const newSessionsCount = selectedDates.filter(date => !originalDates.includes(date)).length;
      
      localStorage.setItem('modificationChangeAmount', changeAmount.toString());
      localStorage.setItem('modificationChangeType', changeType);
      localStorage.setItem('modificationNetChangeCount', netChangeCount.toString());
      localStorage.setItem('modificationNewSessionsCount', newSessionsCount.toString());
      
      // 기존 수강 신청 정보도 저장 (Payment Step에서 비교용)
      if (existingEnrollments) {
        localStorage.setItem('existingEnrollments', JSON.stringify(existingEnrollments));
      }
      
      // 선택된 세션 정보도 저장 (환불 시 필요할 수 있음)
      const selectedSessions = selectedClasses.flatMap(classInfo => 
        classInfo.sessions || []
      );
      localStorage.setItem('selectedSessions', JSON.stringify(selectedSessions));
      localStorage.setItem('selectedClasses', JSON.stringify(selectedClasses));
      
      // Context에도 저장
      setSelectedSessions(selectedSessions);
      
      // onComplete 콜백 호출
      onComplete(selectedDates);
    }
  }
    
  return (
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable]">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b py-5 border-gray-200">

        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center" style={{ color: '#595959' }}>
          수강 변경하실 세션을 선택해주세요.
        </div>
      </header>
      
      {/* 캘린더 */}
      <Calendar 
        onSelectCountChange={setSelectedCount}
        onSelectableCountChange={setSelectableCount}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        isAllSelected={isAllSelected}
        onSelectedClassesChange={setSelectedClasses} // Calendar에서 선택 정보 올림
        month={month || new Date().getMonth() + 1} // props로 받은 월을 우선 사용
        mode="modification"
        existingEnrollments={existingEnrollments}
      />
      
      {/* 전체선택 체크박스 + 하단 버튼 */}
      <DateSelectFooter 
        selectedCount={selectedCount}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        isAllSelected={isAllSelected}
        onGoToPayment={handleModificationComplete}
        mode="modification"
        netChangeCount={netChangeCount}
      />
    </div>
  )
} 