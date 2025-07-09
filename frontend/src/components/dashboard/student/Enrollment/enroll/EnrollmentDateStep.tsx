'use client'
import * as React from 'react'
import Calendar from '@/components/features/student/enrollment/month/date/Calendar'
import DateSelectFooter from '@/components/features/student/enrollment/month/date/DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation'

interface EnrollmentDateStepProps {
  mode?: 'enrollment' | 'modification';
  classId?: number;
  existingEnrollments?: any[];
  month?: number | null;
  onComplete?: (selectedDates: string[]) => void;
}

export function EnrollmentDateStep({ mode = 'enrollment', classId, existingEnrollments, month, onComplete }: EnrollmentDateStepProps) {
  const { enrollment, setEnrollmentStep, setSelectedSessions, goBack } = useDashboardNavigation()
  const { selectedMonth, selectedClassIds } = enrollment
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectableCount, setSelectableCount] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  // 수정 모드일 때 기존 수강 신청 정보를 사용
  const isModificationMode = mode === 'modification';
  
  // Context에서 선택된 클래스 정보를 localStorage에 저장 (Calendar 컴포넌트가 이를 사용함)
  React.useEffect(() => {
    if (isModificationMode && classId) {
      // 수정 모드: 특정 클래스만 선택된 것으로 처리
      const selectedClassCards = [{
        id: classId,
        // Calendar 컴포넌트에서 실제 클래스 정보를 로드할 때 사용
      }];
      localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
    } else if (selectedClassIds && selectedClassIds.length > 0 && typeof window !== 'undefined') {
      // 일반 수강 신청 모드: 기존 로직
      const selectedClassCards = selectedClassIds.map(id => ({
        id: id,
        // Calendar 컴포넌트에서 실제 클래스 정보를 로드할 때 사용
      }));
      localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
    } else {
      // 선택된 클래스가 없으면 localStorage에서 제거
      localStorage.removeItem('selectedClassCards');
    }
  }, [selectedClassIds, isModificationMode, classId]); 
    
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: isModificationMode ? '수강 변경' : '클래스 선택',
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
      label: isModificationMode ? '변경 확인' : '결제하기',
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
    if (!isModificationMode || !existingEnrollments) return 0;
    
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
  }, [isModificationMode, existingEnrollments, selectedDates]);

  // 결제 페이지로 이동 및 localStorage 저장
  const handleGoToPayment = () => {
    if (typeof window !== 'undefined') {
      if (isModificationMode) {
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
        
        // onComplete 콜백 호출 (수강 변경 모드에서만)
        if (onComplete) {
          onComplete(selectedDates);
        }
      } else {
        // 일반 수강 신청 모드: 기존 로직
        const selectedSessions = selectedClasses.flatMap(classInfo => 
          classInfo.sessions || []
        );
        
        localStorage.setItem('selectedSessions', JSON.stringify(selectedSessions));
        localStorage.setItem('selectedClasses', JSON.stringify(selectedClasses));
        
        // Context에도 저장
        setSelectedSessions(selectedSessions);
      }
    }
    
    // 수강 변경 모드에서는 onComplete가 단계 전환을 처리하므로 여기서는 payment로 이동하지 않음
    if (!isModificationMode) {
      setEnrollmentStep('payment');
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
          {isModificationMode 
            ? '수강 변경하실 세션을 선택해주세요.'
            : '수강하실 클래스의 일자를 1개 이상 선택해주세요.'
          }
        </div>
      </header>
      
      {/* 선택된 클래스가 없을 때 */}
      {(!isModificationMode && (!selectedClassIds || selectedClassIds.length === 0)) ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">선택된 클래스가 없습니다</p>
            <p className="text-gray-600 mb-4">먼저 클래스를 선택해주세요</p>
            <button
              onClick={() => setEnrollmentStep('class-selection')}
              className="px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
            >
              클래스 선택으로 돌아가기
            </button>
          </div>
        </div>
      ) : (
        /* 캘린더 */
        <Calendar 
          onSelectCountChange={setSelectedCount}
          onSelectableCountChange={setSelectableCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isAllSelected={isAllSelected}
          onSelectedClassesChange={setSelectedClasses} // Calendar에서 선택 정보 올림
          month={month || selectedMonth || new Date().getMonth() + 1} // props로 받은 월을 우선 사용
          mode={mode}
          existingEnrollments={existingEnrollments}
        />
      )}
      
      {/* 전체선택 체크박스 + 하단 버튼 - 선택된 클래스가 있을 때만 표시 */}
      {((isModificationMode && classId) || (selectedClassIds && selectedClassIds.length > 0)) && (
        <DateSelectFooter 
          selectedCount={selectedCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isAllSelected={isAllSelected}
          onGoToPayment={handleGoToPayment}
          mode={mode}
          netChangeCount={netChangeCount}
        />
      )}
    </div>
  )
} 