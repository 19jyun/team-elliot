'use client'
import * as React from 'react'
import Calendar from '@/components/features/student/enrollment/month/date/Calendar'
import DateSelectFooter from '@/components/features/student/enrollment/month/date/DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useDashboardNavigation } from '@/contexts/DashboardContext'

interface EnrollmentDateStepProps {
  month?: number | null;
}

export function EnrollmentDateStep({ month }: EnrollmentDateStepProps) {
  const { enrollment, setEnrollmentStep, setSelectedSessions } = useDashboardNavigation()
  const { selectedMonth, selectedClassIds, selectedClassesWithSessions } = enrollment
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectableCount, setSelectableCount] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  
  // Context에서 선택된 클래스 정보를 localStorage에 저장 (Calendar 컴포넌트가 이를 사용함)
  React.useEffect(() => {
    if (selectedClassIds && selectedClassIds.length > 0 && typeof window !== 'undefined') {
      // 일반 수강 신청 모드: Context에서 가져온 세션 정보 사용
      const selectedClassCards = selectedClassesWithSessions.map(classInfo => ({
        id: classInfo.id,
        sessions: classInfo.sessions,
        // Calendar 컴포넌트에서 실제 클래스 정보를 로드할 때 사용
      }));
      localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
    } else {
      // 선택된 클래스가 없으면 localStorage에서 제거
      localStorage.removeItem('selectedClassCards');
    }
  }, [selectedClassIds, selectedClassesWithSessions]);
    
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
      label: '결제하기',
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

  // 결제 페이지로 이동 및 localStorage 저장
  const handleGoToPayment = () => {
    if (typeof window !== 'undefined') {
      // 일반 수강 신청 모드: 기존 로직
      const selectedSessions = selectedClasses.flatMap(classInfo => 
        classInfo.sessions || []
      );
      
      localStorage.setItem('selectedSessions', JSON.stringify(selectedSessions));
      localStorage.setItem('selectedClasses', JSON.stringify(selectedClasses));
      
      // Context에도 저장
      setSelectedSessions(selectedSessions);
    }
    
    setEnrollmentStep('payment');
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
          수강하실 클래스의 일자를 1개 이상 선택해주세요.
        </div>
      </header>
      
      {/* 선택된 클래스가 없을 때 */}
      {(!selectedClassIds || selectedClassIds.length === 0) ? (
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
        />
      )}
      
      {/* 전체선택 체크박스 + 하단 버튼 - 선택된 클래스가 있을 때만 표시 */}
      {selectedClassIds && selectedClassIds.length > 0 && (
        <DateSelectFooter 
          selectedCount={selectedCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          isAllSelected={isAllSelected}
          onGoToPayment={handleGoToPayment}
        />
      )}
    </div>
  )
} 