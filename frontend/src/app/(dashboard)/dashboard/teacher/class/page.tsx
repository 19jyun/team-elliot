'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { getTeacherClassesWithSessions } from '@/api/teacher'
import { TeacherClassesWithSessionsResponse } from '@/types/api/teacher'
import { DateSessionModal } from '@/components/common/DateSessionModal/DateSessionModal'
import { SessionDetailModal } from '@/components/common/DateSessionModal/SessionDetailModal'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { ClassSession } from '@/types/api/class'
import { useDashboardNavigation } from '@/contexts/DashboardContext'

// Type for extended session
type ExtendedSession = {
  accessToken?: string
  user: {
    id: string
    role: string
    accessToken?: string
  } & { name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined }
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const { navigateToSubPage } = useDashboardNavigation()
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [selectedDaySessions, setSelectedDaySessions] = useState<any[]>([])
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  // 선생님 클래스와 세션 정보를 한 번에 조회 (토큰 기반)
  const { data: myData, isLoading, error } = useQuery({
    queryKey: ['teacher-classes-with-sessions'],
    queryFn: getTeacherClassesWithSessions,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

  const mySessions = (myData as TeacherClassesWithSessionsResponse)?.sessions || []

  // ConnectedCalendar용 데이터 변환
  const convertedSessions = useMemo(() => {
    if (!mySessions) return [];
    
    return mySessions.map((session: any) => ({
      id: session.id,
      classId: session.classId || session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // teacher-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime: new Date(session.date + ' ' + session.startTime) < new Date(),
      isAlreadyEnrolled: false, // teacher-view에서는 해당 없음
      studentEnrollmentStatus: 'CONFIRMED', // teacher-view에서는 해당 없음
      class: {
        id: session.class?.id || session.classId || session.id,
        className: session.class?.className || '클래스',
        level: session.class?.level || 'BEGINNER',
        tuitionFee: session.class?.tuitionFee?.toString() || '50000',
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || '선생님',
        },
      },
    })) as ClassSession[];
  }, [mySessions]);

  // 백엔드에서 받은 캘린더 범위 사용 (새로운 정책 적용)
  const calendarRange = useMemo(() => {
    if (!myData?.calendarRange) {
      // 백엔드에서 범위를 받지 못한 경우 기본값 사용 (현재 월부터 3개월)
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0), // 현재 월 + 2개월 = 3개월 범위
      };
    }

    return {
      startDate: new Date(myData.calendarRange.startDate),
      endDate: new Date(myData.calendarRange.endDate),
    };
  }, [myData?.calendarRange]);

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
              signOut({ redirect: true, callbackUrl: '/auth' });
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

  // 날짜 클릭 핸들러 (ConnectedCalendar용)
  const handleDateClick = (dateString: string) => {
    const clickedDateObj = new Date(dateString);
    
    // 해당 날짜의 세션들 필터링
    const daySessions = mySessions?.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === clickedDateObj.toDateString();
    }) || [];

    setClickedDate(clickedDateObj);
    setSelectedDaySessions(daySessions);
    setIsDateModalOpen(true);
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
    // setIsDateModalOpen(false) 제거 - 날짜 모달이 닫히지 않도록 함
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  // 담당 클래스 SubPage로 이동
  const handleTeacherClassesClick = () => {
    navigateToSubPage('teacher-classes')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        {/* 환영 메시지 + 캘린더 아이콘 버튼 */}
        <div className="flex flex-col px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-700">
                안녕하세요, {session?.user?.name} 선생님!
              </h1>
              <p className="mt-2 text-stone-500">오늘도 즐거운 수업되세요!</p>
            </div>
            {/* 캘린더 아이콘 버튼 */}
            <button
              onClick={handleTeacherClassesClick}
              className="flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
              aria-label="담당 클래스 보기"
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
            mode="teacher-view"
            sessions={convertedSessions}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // teacher-view에서는 선택 기능 없음
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
        sessions={selectedDaySessions}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        role="teacher"
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetailModal}
        role="teacher"
      />
    </div>
  )
}
