'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

import { getMyClasses } from '@/api/student'
import { EnrolledClassesList } from '@/components/features/student/classes/EnrolledClassesList'
import { ClassSessionModal } from '@/components/features/student/classes/ClassSessionModal'
import { DateSessionModal } from '@/components/calendar/DateSessionModal'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import { MonthSelector } from '@/components/calendar/MonthSelector'

// Type for extended session
type ExtendedSession = {
  accessToken?: string
  user: {
    id: string
    role: string
    accessToken?: string
  } & { name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined }
}

export default function StudentDashboard() {
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
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [selectedDaySessions, setSelectedDaySessions] = useState<any[]>([])
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  const { data: myClasses, isLoading, error } = useQuery({
    queryKey: ['my-classes'],
    queryFn: getMyClasses,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

  // myClasses 객체 로그 출력
  console.log('myClasses:', myClasses)

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
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
      <div className="flex flex-col items-center justify-center min-h-full">
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
  }

  const handleClassClick = (classData: any) => {
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setSelectedClass(null)
  }

  // 날짜 클릭 핸들러 추가
  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return

    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    const clickedDateObj = new Date(currentYear, currentMonth, day)
    
    // 해당 날짜의 세션들 필터링
    const daySessions = myClasses?.sessionClasses?.filter((session: any) => {
      const sessionDate = new Date(session.date)
      return sessionDate.getDate() === day &&
             sessionDate.getMonth() === currentMonth &&
             sessionDate.getFullYear() === currentYear
    }) || []

    setClickedDate(clickedDateObj)
    setSelectedDaySessions(daySessions)
    setIsDateModalOpen(true)
  }

  const closeDateModal = () => {
    setIsDateModalOpen(false)
    setClickedDate(null)
    setSelectedDaySessions([])
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
    setIsSessionDetailModalOpen(true)
    setIsDateModalOpen(false) // 날짜 모달 닫기
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
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
        hasEvent: myClasses?.enrollmentClasses?.some((class_: any) => {
          const classDate = new Date(class_.startTime)
          return classDate.getDate() === i &&
                 classDate.getMonth() === currentMonth &&
                 classDate.getFullYear() === currentYear
        }) || myClasses?.sessionClasses?.some((session: any) => {
          const sessionDate = new Date(session.date)
          return sessionDate.getDate() === i &&
                 sessionDate.getMonth() === currentMonth &&
                 sessionDate.getFullYear() === currentYear
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
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        {/* 환영 메시지 + 캘린더 */}
        <div className="flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            안녕하세요, {session?.user?.name}님!
          </h1>
          <p className="mt-2 text-stone-500">오늘도 즐거운 학습되세요!</p>
        </div>

        {/* 캘린더 섹션 */}
        <div className="flex flex-col w-full text-center whitespace-nowrap bg-white text-stone-700">
          <div className="flex items-center justify-between px-7 pt-3 pb-2 w-full text-base font-semibold relative">
            <div
              className="flex gap-1.5 items-center cursor-pointer"
              onClick={() => setIsMonthPickerOpen(true)}
            >
              <span>{format(selectedDate, 'yyyy년')}</span>
              <span>{format(selectedDate, 'M월')}</span>
              <ChevronDownIcon className="h-4 w-4 text-stone-700" />
            </div>
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
                      className={`w-[50px] h-[50px] flex items-center justify-center relative cursor-pointer hover:bg-stone-50 rounded-lg transition-colors ${
                        day.isCurrentMonth ? 'text-stone-700' : 'text-stone-300'
                      }`}
                      onClick={() => handleDateClick(day.day, day.isCurrentMonth)}
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
      </header>
      
      <main className="flex-1 min-h-0 bg-white px-5">
                <div className="gap-2.5 self-start px-2 py-3 text-base font-semibold tracking-normal leading-snug text-stone-700 flex-shrink-0 ">
          수강중인 클래스
        </div>
        <div className="w-full overflow-auto" style={{ 
          maxHeight: 'calc(100vh - 650px)',  // 최대 높이만 설정
          minHeight: '200px'  // 최소 높이 보장
        }}>
          {/* 수강중인 클래스 리스트 */}
          <div className="flex flex-col mt-4 w-full h-full">
            <EnrolledClassesList
              classes={myClasses?.enrollmentClasses || []}
              onClassClick={handleClassClick}
            />
          </div>
        </div>
      </main>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={myClasses?.sessionClasses || []}
        onClose={closeSessionModal}
      />

      {/* Date Session Modal */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        sessions={selectedDaySessions}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        userRole="student"
      />

      {/* Student Session Detail Modal */}
      <StudentSessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetailModal}
      />

      {/* Month Selector Modal */}
      <MonthSelector
        isOpen={isMonthPickerOpen}
        selectedMonth={selectedDate.getMonth()}
        onClose={() => setIsMonthPickerOpen(false)}
        onMonthSelect={handleMonthChange}
      />
    </div>
  )
}
