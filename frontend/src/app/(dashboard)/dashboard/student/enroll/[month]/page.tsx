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

  const timeSlots = ['4', '5', '6', '7', '8', '9', '10', '11', '12']
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

      <div className="flex-1 overflow-hidden mx-auto w-full max-w-[480px]">
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col mt-0 w-full text-sm font-medium tracking-normal leading-snug text-center whitespace-nowrap text-zinc-600">
            <div className="flex overflow-x-auto scrollbar-hide relative">
              <div className="flex flex-col min-w-[calc(140%+25px)]">
                <div className="sticky flex relative border-b border-solid border-b-zinc-100 bg-white z-50">
                  <div className="sticky left-0 z-50 bg-white w-[25px] h-[30px]" />
                  <div className="flex flex-1">
                    {['월', '화', '수', '목', '금', '토', '일'].map(
                      (day, index) => (
                        <div key={index} className="flex-1 py-1.5">
                          {day}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <div className="flex flex-col w-full">
                    {timeSlots.map((hour, index) => (
                      <TimeSlot key={index} hour={hour} />
                    ))}
                    {classCards?.map((card) => {
                      console.log('=== CARD MAPPING DEBUG ===')
                      console.log('Processing card:', card)
                      console.log('Card ID:', card.id)
                      console.log('Card level:', card.level)
                      console.log('Card teacher:', card.teacher)
                      console.log('Card dayOfWeek:', card.dayOfWeek)
                      console.log('Card startTime:', card.startTime)
                      console.log('Card endTime:', card.endTime)
                      console.log('Card backgroundColor:', card.backgroundColor)
                      
                      // Calculate day index
                      const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(card.dayOfWeek)
                      console.log('Calculated dayIndex:', dayIndex)
                      
                      // Calculate start hour - use 'startTime' field which is a Date object
                      let startTimeString = '00:00'
                      let endTimeString = '01:00'
                      
                      if (card.startTime) {
                        const startTimeDate = new Date(card.startTime)
                        const utcHours = startTimeDate.getUTCHours()
                        const utcMinutes = startTimeDate.getUTCMinutes()
                        startTimeString = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`
                      }
                      
                      if (card.endTime) {
                        const endTimeDate = new Date(card.endTime)
                        const utcHours = endTimeDate.getUTCHours()
                        const utcMinutes = endTimeDate.getUTCMinutes()
                        endTimeString = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`
                      }
                      
                      const startHour = parseInt(startTimeString.split(':')[0])
                      console.log('Start time string:', startTimeString, 'End time string:', endTimeString, 'Start hour:', startHour)
                      
                      // Handle background color
                      const bgColor = card.backgroundColor ? `bg-${card.backgroundColor}` : 'bg-gray-100'
                      console.log('Background color:', bgColor)
                      console.log('=== END CARD MAPPING DEBUG ===')
                      
                      return (
                        <ClassCard 
                          key={card.id} 
                          level={card.level || '기본'}
                          teacher={card.teacher?.name || '선생님'}
                          startTime={startTimeString}
                          endTime={endTimeString}
                          dayIndex={dayIndex}
                          startHour={startHour}
                          bgColor={bgColor}
                          containerWidth="100%"
                          onInfoClick={() => handleClassInfoClick(card.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button className="flex-1 shrink gap-2.5 self-stretch px-2.5 py-4 rounded-lg bg-zinc-300 min-w-[240px] size-full">
            클래스를 1개 이상 선택 해 주세요
          </button>
        </div>
      </footer>
    </div>
  )
}
