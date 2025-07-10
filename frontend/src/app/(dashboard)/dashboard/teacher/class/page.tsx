'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

import { getMyTeacherClassesWithSessions } from '@/api/teacher'
import { TeacherClassSessionModal } from '@/components/features/teacher/classes/TeacherClassSessionModal'
import { TeacherClassesList } from '@/components/features/teacher/classes/TeacherClassesList'
import { TeacherClassesWithSessionsResponse } from '@/types/api/teacher'

// Type for extended session
type ExtendedSession = {
  accessToken?: string
  user: {
    id: string
    role: string
    accessToken?: string
  } & { name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined }
}

type ClassData = TeacherClassesWithSessionsResponse['classes'][0]

export default function TeacherDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  // 선생님 클래스와 세션 정보를 한 번에 조회 (토큰 기반)
  const { data: myData, isLoading, error } = useQuery({
    queryKey: ['teacher-classes-with-sessions'],
    queryFn: getMyTeacherClassesWithSessions,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

  console.log("log", myData)
  console.log("sessions", myData?.sessions)

  const myClasses = myData?.classes || []
  const mySessions = myData?.sessions || []

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리
  if (error) {
    if ((error as any)?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/login' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const handleMonthChange = (month: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(month)
    setSelectedDate(newDate)
    setIsMonthPickerOpen(false)
  }

  const handleClassClick = (classData: any) => {
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setSelectedClass(null)
  }

  const generateCalendarDays = () => {
    const days = []
    const totalDays = 35
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()

    // 이전 달의 날짜 채우기
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false })
    }

    // 현재 달의 날짜 채우기
    for (let i = 1; i <= lastDay; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        hasEvent: mySessions?.some((session: any) => {
          const sessionDate = new Date(session.date)
          return sessionDate.getDate() === i
        }),
      })
    }

    // 다음 달의 날짜 채우기
    const remainingDays = 35 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }

    return days
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-2 w-full bg-white">

      {/* 환영 메시지 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          안녕하세요, {session?.user?.name} 선생님!
        </h1>
        <p className="mt-2 text-stone-500">오늘도 즐거운 수업되세요!</p>
      </div>

      {/* 캘린더 섹션 */}
      <div className="flex flex-col w-full text-center whitespace-nowrap bg-white text-stone-700">
        <div className="flex items-center justify-between px-7 pt-3 pb-2 w-full text-base font-semibold relative">
          <div
            className="flex gap-1.5 items-center cursor-pointer"
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
          >
            <span>{format(selectedDate, 'yyyy년')}</span>
            <span>{format(selectedDate, 'M월')}</span>
            <ChevronDownIcon className="h-4 w-4 text-stone-700" />
          </div>

          {/* 월 선택 드롭다운 */}
          {isMonthPickerOpen && (
            <>
              <div
                className="fixed inset-0 bg-stone-900 bg-opacity-30 z-50"
                onClick={() => setIsMonthPickerOpen(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 flex flex-col w-full bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="text-lg font-semibold text-stone-700">
                    월 선택
                  </h3>
                  <button
                    onClick={() => setIsMonthPickerOpen(false)}
                    className="text-stone-500 hover:text-stone-700"
                  >
                    취소
                  </button>
                </div>
                <div className="flex overflow-hidden flex-col py-3 w-full">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthChange(index)}
                        className={`flex items-center justify-center p-3 rounded-lg ${
                          selectedDate.getMonth() === index
                            ? 'bg-stone-100 text-stone-700'
                            : 'hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        {index + 1}월
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 p-4 border-t">
                  <button
                    onClick={() => setIsMonthPickerOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200"
                  >
                    확인
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 요일 헤더 */}
        <div className="flex justify-around px-2.5 w-full text-sm font-medium">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="w-[50px] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="flex flex-col w-full text-base">
          {Array.from({ length: 5 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex justify-around px-2.5 mt-2">
              {generateCalendarDays()
                .slice(weekIndex * 7, (weekIndex + 1) * 7)
                .map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-[50px] h-[50px] flex items-center justify-center relative ${
                      day.isCurrentMonth ? 'text-stone-700' : 'text-stone-300'
                    }`}
                  >
                    {day.day}
                    {day.hasEvent && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#573B30] rounded-full" />
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex mt-4 w-full opacity-50 bg-zinc-100 min-h-[8px]" />

      {/* 수업 목록 섹션 */}
      <div className="flex flex-col px-5 mt-4 w-full">
        <div className="flex flex-col mt-5 w-full">
          <div className="gap-2.5 self-start px-2 py-3 text-base font-semibold tracking-normal leading-snug text-stone-700">
            담당 클래스
          </div>
          <TeacherClassesList
            classes={myClasses || []}
            onClassClick={handleClassClick}
          />
        </div>
      </div>

      {/* Teacher Class Session Modal */}
      <TeacherClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={mySessions}
        onClose={closeSessionModal}
      />
    </div>
  )
}
