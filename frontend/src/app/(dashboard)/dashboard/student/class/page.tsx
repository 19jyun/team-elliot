'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { DateSessionModal } from '@/components/common/DateSessionModal/DateSessionModal'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { useStudentData } from '@/hooks/redux/useStudentData'

export default function StudentDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const { navigateToSubPage } = useDashboardNavigation()

  // Redux 데이터 사용
  const { 
    convertedSessions, 
    calendarRange, 
    isLoading, 
    error 
  } = useStudentData()

  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

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

  // 날짜 클릭 핸들러 추가 (ConnectedCalendar용)
  const handleDateClick = (date: string) => {
    const clickedDateObj = new Date(date)
    setClickedDate(clickedDateObj)
    setIsDateModalOpen(true)
  }

  const closeDateModal = () => {
    setIsDateModalOpen(false)
    setClickedDate(null)
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
    setIsSessionDetailModalOpen(true)
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
    // 세션 상세 모달이 닫힐 때 날짜 모달도 함께 닫기
    setIsDateModalOpen(false)
    setClickedDate(null)
  }

  // 수강중인 클래스 SubPage로 이동
  const handleEnrolledClassesClick = () => {
    navigateToSubPage('enrolled-classes')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        {/* 환영 메시지 + 캘린더 아이콘 버튼 */}
        <div className="flex flex-col px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-700">
                안녕하세요, {session?.user?.name}님!
              </h1>
              <p className="mt-2 text-stone-500">오늘도 즐거운 학습되세요!</p>
            </div>
            {/* 캘린더 아이콘 버튼 */}
            <button
              onClick={handleEnrolledClassesClick}
              className="flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
              aria-label="수강중인 클래스 보기"
            >
              <svg
                className="w-6 h-6 text-stone-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 캘린더 섹션 - 기존 크기 복원 */}
        <div className="flex flex-col w-full bg-white text-stone-700" style={{ height: 'calc(100vh - 450px)' }}>
          <CalendarProvider
            mode="student-view"
            sessions={convertedSessions}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // student-view에서는 선택 기능 없음
            onDateClick={handleDateClick}
            calendarRange={calendarRange}
          >
            <ConnectedCalendar />
          </CalendarProvider>
        </div>
      </header>

      {/* Date Session Modal */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        role="student"
      />

      {/* Student Session Detail Modal */}
      <StudentSessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetailModal}
        onlyDetail={false}
      />
    </div>
  )
}
