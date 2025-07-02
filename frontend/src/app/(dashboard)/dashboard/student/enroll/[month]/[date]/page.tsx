'use client'
import * as React from 'react'
import Calendar from './Calendar'
import DateSelectFooter from './DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '../StatusStep'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function EnrollmentDatePage() {
  const router = useRouter()
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectableCount, setSelectableCount] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);
    
  const statusSteps = [
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
    
  return (
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable]">
      {/* 헤더 */}
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
          수강하실 클래스의 일자를 <span style={{ color: '#AC9592' }}>1개 이상</span> 선택해주세요.
        </div>
      </header>
      {/* 캘린더 */}
      <Calendar 
        onSelectCountChange={setSelectedCount}
        onSelectableCountChange={setSelectableCount}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        isAllSelected={isAllSelected}
      />
      {/* 전체선택 체크박스 + 하단 버튼 */}
      <DateSelectFooter 
        selectedCount={selectedCount}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        isAllSelected={isAllSelected}
      />
    </div>
  )
} 