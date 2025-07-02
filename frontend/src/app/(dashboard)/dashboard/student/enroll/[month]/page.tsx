'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { getClassCards, getClassDetails } from '@/app/api/classes'
import { RefundPolicy } from '../RefundPolicy'
import { ClassCard } from './ClassCard'
import { TimeSlot } from './TimeSlot'
import { StatusStep } from './StatusStep'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { ClassDetails } from './ClassDetails'
import { ClassDetailsResponse } from '@/types/api/class'
import { useState } from 'react'

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const daysKor = ['월', '화', '수', '목', '금', '토', '일']
const timeSlots = [
  '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
]

function formatTime(date: string | Date) {
  const d = new Date(date)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function EnrollmentMonthPage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const requestedMonth = Number(params.month)

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
      router.push('/dashboard/student/enroll')
      return
    }
  }, [currentMonth, nextMonth, requestedMonth, router])

  const [showPolicy, setShowPolicy] = React.useState(true)
  const [agreed, setAgreed] = React.useState(false)
  const [showClassDetails, setShowClassDetails] = React.useState(false)
  const [selectedClassDetails, setSelectedClassDetails] = React.useState<ClassDetailsResponse | null>(null)
  const [showPolicyButton, setShowPolicyButton] = React.useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: classCards, isLoading } = useQuery({
    queryKey: ['classCards', params.month],
    queryFn: () => {
      const year =
        requestedMonth === 1 && currentMonth === 12
          ? currentDate.getFullYear() + 1
          : currentDate.getFullYear()

      console.log('=== API QUERY DEBUG ===')
      console.log('Querying for month:', params.month, 'year:', year)
      const result = getClassCards(`${params.month}`, year)
      console.log('API call result:', result)
      return result
    },
    enabled: !!params.month,
  })

  // Debug logging for API response
  React.useEffect(() => {
    console.log('=== API RESPONSE DEBUG ===')
    console.log('classCards data:', classCards)
    console.log('classCards type:', typeof classCards)
    console.log('classCards length:', classCards?.length)
    console.log('isLoading:', isLoading)
    
    if (classCards && classCards.length > 0) {
      console.log('First class card raw data:', classCards[0])
      console.log('All class cards:', classCards)
    } else {
      console.log('No class cards found or empty array')
    }
    console.log('=== END API RESPONSE DEBUG ===')
  }, [classCards, isLoading])

  React.useEffect(() => {
    const hasAgreed = localStorage.getItem('refundPolicyAgreed') === 'true'
    if (hasAgreed) {
      setShowPolicy(false)
      setShowPolicyButton(true)
    }
  }, [])

  const statusSteps = [
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

  if (showPolicy) {
    return <RefundPolicy onClose={() => setShowPolicy(false)} />
  }

  if (showClassDetails && selectedClassDetails) {
    return (
      <ClassDetails
        onClose={() => setShowClassDetails(false)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
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

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          수강하실 클래스를 모두 선택해주세요.
        </div>
        {showPolicyButton && (
          <button
            onClick={() => setShowPolicy(true)}
            className="absolute right-4 top-20 flex items-center gap-1 px-3 py-1.5 text-sm bg-stone-50 text-stone-600 rounded-full border border-stone-200 hover:bg-stone-100"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            약관 확인
          </button>
        )}
      </header>

      <div className="flex-1 overflow-x-auto mx-auto w-full bg-white">
        {/* Hour labels at the top */}
        <div className="grid min-w-[450px] sm:min-w-[700px] md:min-w-[900px]" style={{
          display: 'grid',
          gridTemplateColumns: `60px repeat(7, 70px)`,
          gridTemplateRows: `40px repeat(${timeSlots.length}, 1fr)`
        }}>
          {/* Header row: empty cell + hour labels */}
          <div />
          {daysKor.map(day => (
            <div key={day} className="flex items-center justify-center font-semibold text-sm border-b border-gray-200 bg-white sticky top-0 z-20">{day}</div>
          ))}
          {/* For each row: hour label at the start, then cells */}
          {timeSlots.map((time, rowIdx) => (
            <React.Fragment key={time}>
              {/* Hour label at the start of each row */}
              <div className="flex items-center justify-center text-xs text-gray-400 border-r border-gray-200 bg-white sticky left-0 z-10">{time}</div>
              {days.map((day, colIdx) => (
                <div key={day + time} className="relative border-b border-r border-gray-100 min-h-[60px] flex flex-col gap-1">
                  {classCards?.filter(card => {
                    const cardDay = card.dayOfWeek;
                    const cardTime = formatTime(card.startTime);
                    return cardDay === day && cardTime === time;
                  }).map(card => {
                    const dayIndex = days.indexOf(card.dayOfWeek);
                    const startHour = Number(formatTime(card.startTime).split(':')[0]);
                    const bgColor = card.backgroundColor ? `bg-${card.backgroundColor}` : 'bg-gray-100';
                    return (
                      <ClassCard
                        key={card.id}
                        {...card}
                        className={card.className}
                        teacher={card.teacher?.name || '선생님'}
                        startTime={formatTime(card.startTime)}
                        endTime={formatTime(card.endTime)}
                        dayIndex={dayIndex}
                        startHour={startHour}
                        bgColor={bgColor}
                        selected={selectedIds.includes(card.id)}
                        onClick={() => handleSelect(card.id)}
                        onInfoClick={() => handleClassInfoClick(card.id)}
                        containerWidth="100%"
                      />
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${selectedIds.length > 0 ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
            disabled={selectedIds.length === 0}
            onClick={() => {
              if (selectedIds.length > 0) {
                const month = params.month;
                // 선택된 클래스 전체 정보 추출
                const selectedClassCards = classCards?.filter(card => selectedIds.includes(card.id)) || [];
                localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
                router.push(`/dashboard/student/enroll/${month}/date`);
              }
            }}
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
    </div>
  )
}
