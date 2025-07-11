'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { getClassCards, getClassDetails } from '@/app/api/classes'
import { getClassesWithSessionsByMonth } from '@/api/class'
import { ClassesWithSessionsByMonthResponse } from '@/types/api/class'
import { RefundPolicy } from '@/components/features/student/enrollment/RefundPolicy'
import { ClassCard } from '@/components/features/student/enrollment/month/ClassCard'
import { TimeSlot } from '@/components/features/student/enrollment/month/TimeSlot'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { ClassDetails } from '@/components/features/student/enrollment/month/ClassDetails'
import { ClassDetailsResponse } from '@/types/api/class'
import { useState } from 'react'
import { useDashboardNavigation } from '@/contexts/DashboardContext'

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const daysKor = ['월', '화', '수', '목', '금', '토', '일']
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', 
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
]

function formatTime(date: string | Date) {
  const d = new Date(date)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function EnrollmentClassStep() {
  const dashboardContext = useDashboardNavigation()
  
  // Context가 undefined인 경우를 처리
  if (!dashboardContext) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }
  
  const { enrollment, setEnrollmentStep, setSelectedClassIds, setSelectedClassesWithSessions, goBack, navigateToSubPage } = dashboardContext
  const { selectedMonth, selectedAcademyId } = enrollment
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // 로그인 페이지로 리다이렉트는 상위에서 처리
    },
  })

  // SubPage 설정 - EnrollmentClassStep이 실제 SubPage
  React.useEffect(() => {
    // 수강신청 페이지에서는 슬라이드 애니메이션을 허용하기 위해 
    // 포커스를 dashboard로 유지하되, subPage 상태만 설정
    navigateToSubPage('enroll')
  }, [navigateToSubPage])

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const requestedMonth = selectedMonth || currentMonth

  React.useEffect(() => {
    // const isEndOfMonth = currentDate.getDate() >= 25
    const isEndOfMonth = true

    const isAccessible =
      requestedMonth === currentMonth ||
      (isEndOfMonth &&
        ((currentMonth === 12 && requestedMonth === 1) ||
          (currentMonth !== 12 && requestedMonth === nextMonth)))

    if (!isAccessible) {
      toast.error('해당 월의 수강신청 기간이 아닙니다')
      goBack()
      return
    }
  }, [currentMonth, nextMonth, requestedMonth, goBack])

  const [showPolicy, setShowPolicy] = React.useState(true)
  const [agreed, setAgreed] = React.useState(false)
  const [showClassDetails, setShowClassDetails] = React.useState(false)
  const [selectedClassDetails, setSelectedClassDetails] = React.useState<ClassDetailsResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: classesWithSessions, isLoading } = useQuery({
    queryKey: ['classesWithSessions', requestedMonth, selectedAcademyId],
    queryFn: () => {
      const year =
        requestedMonth === 1 && currentMonth === 12
          ? currentDate.getFullYear() + 1
          : currentDate.getFullYear()

      console.log('=== API QUERY DEBUG ===')
      console.log('Querying for month:', requestedMonth, 'year:', year)
      console.log('Selected academy ID:', selectedAcademyId)
      const result = getClassesWithSessionsByMonth(`${requestedMonth}`, year)
      console.log('API call result:', result)
      return result
    },
    enabled: !!requestedMonth && selectedAcademyId !== null,
  })

  // 선택된 학원에 속한 클래스만 필터링
  const filteredClassesWithSessions = React.useMemo(() => {
    if (!classesWithSessions || selectedAcademyId === null) return []
    
    return classesWithSessions.filter((classInfo: ClassesWithSessionsByMonthResponse) => 
      classInfo.academyId === selectedAcademyId
    )
  }, [classesWithSessions, selectedAcademyId])

  // Debug logging for API response
  React.useEffect(() => {
    console.log('=== API RESPONSE DEBUG ===')
    console.log('classCards data:', classesWithSessions)
    console.log('filteredClassCards data:', filteredClassesWithSessions)
    console.log('classCards type:', typeof classesWithSessions)
    console.log('classCards length:', classesWithSessions?.length)
    console.log('filteredClassCards length:', filteredClassesWithSessions?.length)
    console.log('isLoading:', isLoading)
    
    if (filteredClassesWithSessions && filteredClassesWithSessions.length > 0) {
      console.log('First filtered class card raw data:', filteredClassesWithSessions[0])
      console.log('All filtered class cards:', filteredClassesWithSessions)
    } else {
      console.log('No filtered class cards found or empty array')
    }
    console.log('=== END API RESPONSE DEBUG ===')
  }, [classesWithSessions, filteredClassesWithSessions, isLoading])

  // localStorage 확인하여 이전에 동의했다면 정책 건너뛰기
  React.useEffect(() => {
    const hasAgreed = localStorage.getItem('refundPolicyAgreed') === 'true'
    if (hasAgreed) {
      setShowPolicy(false)
    }
  }, [])

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
      isActive: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
    },
  ]

  const handleClassInfoClick = async (classId: number) => {
    try {
      const details = await getClassDetails(classId)
      if (!details) {
        throw new Error('No class details returned')
      }
      setSelectedClassDetails(details)
      setShowClassDetails(true)
    } catch (error) {
      console.error('Failed to fetch class details:', error)
      toast.error('클래스 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleNextStep = () => {
    if (selectedIds.length === 0) {
      toast.error('최소 1개 이상의 클래스를 선택해주세요.')
      return
    }
    
    // 선택된 클래스들의 세션 정보를 Context에 저장
    const selectedClassesData = filteredClassesWithSessions?.filter((classInfo: ClassesWithSessionsByMonthResponse) => 
      selectedIds.includes(classInfo.id)
    ) || []
    
    setSelectedClassIds(selectedIds)
    setSelectedClassesWithSessions(selectedClassesData)
    setEnrollmentStep('date-selection')
  }

  // For horizontal scroll, show only 5 days at a time
  const visibleDays = days.slice(0, 5)
  const visibleDaysKor = daysKor.slice(0, 5)

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (showClassDetails && selectedClassDetails) {
    return (
      <div className="w-full h-full">
        <ClassDetails
          onClose={() => {
            // 상태 업데이트를 안전하게 처리
            requestAnimationFrame(() => {
              setShowClassDetails(false)
            })
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 밑의 페이지 - 항상 렌더링 */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          수강하실 클래스를 모두 선택해주세요.
        </div>
      </header>

      {/* Scrollable Timetable Section */}
      <main className="flex-1 min-h-0 bg-white px-5">
        {/* Timetable Container with Scroll */}
        <div className="w-full overflow-auto" style={{ 
          height: 'calc(100vh - 400px)',
          minHeight: 0 
        }}>
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="grid" style={{ gridTemplateColumns: `60px repeat(7, 70px)`, minWidth: '450px' }}>
              <div className="h-10 bg-white" />
              {daysKor.map(day => (
                <div key={day} className="h-10 flex items-center justify-center font-semibold text-sm text-gray-900">{day}</div>
              ))}
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="grid" style={{
            gridTemplateColumns: `60px repeat(7, 70px)`,
            gridTemplateRows: `repeat(${timeSlots.length}, 60px)`,
            minWidth: '450px',
            width: '100%',
            height: `${timeSlots.length * 60}px`
          }}>
            {timeSlots.map((time, rowIdx) => (
              <div
                key={time}
                className="sticky left-0 z-20 flex items-center justify-center text-xs text-gray-400 border-r border-gray-200 bg-white"
                style={{ gridRow: rowIdx + 1, gridColumn: 1 }}
              >
                {time}
              </div>
            ))}

            {timeSlots.map((time, rowIdx) => (
              days.map((day, colIdx) => {
                const cellKey = `${day}-${time}`
                return (
                  <div
                    key={cellKey}
                    className="relative border-b border-r border-gray-100 flex flex-col gap-1 p-1"
                    style={{ gridRow: rowIdx + 1, gridColumn: colIdx + 2 }}
                  >
                    {filteredClassesWithSessions?.filter((classInfo: ClassesWithSessionsByMonthResponse) =>
                      classInfo.dayOfWeek === day && formatTime(classInfo.startTime) === time
                    ).map((classInfo: ClassesWithSessionsByMonthResponse) => (
                      <ClassCard
                        key={classInfo.id}
                        {...classInfo}
                        className={classInfo.className}
                        teacher={classInfo.teacher?.name || '선생님'}
                        startTime={formatTime(classInfo.startTime)}
                        endTime={formatTime(classInfo.endTime)}
                        dayIndex={days.indexOf(classInfo.dayOfWeek)}
                        startHour={Number(formatTime(classInfo.startTime).split(':')[0])}
                        bgColor={classInfo.backgroundColor ? `bg-${classInfo.backgroundColor}` : 'bg-gray-100'}
                        selected={selectedIds.includes(classInfo.id)}
                        onClick={() => handleSelect(classInfo.id)}
                        onInfoClick={() => handleClassInfoClick(classInfo.id)}
                        containerWidth="100%"
                      />
                    ))}
                  </div>
                )
              })
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 flex flex-col w-full bg-white border-t border-gray-200 min-h-[100px]">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${selectedIds.length > 0 ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
            disabled={selectedIds.length === 0}
            onClick={handleNextStep}
          >
            {selectedIds.length > 0 ? (
              <span className="inline-flex items-center justify-center w-full">
                클래스 선택 완료
                <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">{selectedIds.length}</span>
              </span>
            ) : (
              '클래스를 1개 이상 선택 해 주세요'
            )}
          </button>
        </div>
      </footer>

      {/* RefundPolicy Modal - 절대 위치로 위에 배치 */}
      <div className={`absolute inset-0 z-50 ${showPolicy ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <RefundPolicy 
          isOpen={showPolicy}
          onClose={() => {
            // 상태 업데이트를 안전하게 처리
            requestAnimationFrame(() => {
              setShowPolicy(false)
            })
          }} 
        />
      </div>
    </div>
  )
}