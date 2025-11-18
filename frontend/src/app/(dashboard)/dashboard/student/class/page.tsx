'use client'

import { useSession } from '@/lib/auth/AuthProvider'
import { useState, useMemo } from 'react'

import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { SessionCardDisplay } from '@/components/calendar/SessionCardDisplay'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import type { ClassSession, ClassSessionWithCounts } from '@/types/api/class'
import { useStudentCalendarSessions } from '@/hooks/queries/student/useStudentCalendarSessions'
import { useSignOut } from '@/lib/auth/AuthProvider'

export default function StudentDashboard() {
  const signOut = useSignOut()

  const { data: session, status } = useSession()

  // React Query 기반 데이터 관리
  const { data: calendarSessionsData, isLoading, error } = useStudentCalendarSessions();
  const calendarSessions = (calendarSessionsData as ClassSession[]) || [];
  
  // Redux에서 가져온 캘린더 범위를 Date 객체로 변환
  const calendarRangeForCalendar = useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    };
  }, []);
  
  // 선택된 날짜와 세션 상태 (teacher/class/page.tsx와 유사)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<ClassSessionWithCounts[]>([])
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
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
    const errorResponse = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { status?: number } })
      : null;
    if (errorResponse?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/' });
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

  // 날짜 클릭 핸들러 (teacher/class/page.tsx와 유사한 방식)
  const handleDateClick = (dateString: string) => {
    const clickedDateObj = new Date(dateString);
    
    // 같은 날짜를 클릭하면 선택 해제
    if (selectedDate && selectedDate.toISOString().split('T')[0] === dateString) {
      setSelectedDate(null);
      setSelectedSessions([]);
      return;
    }
    
    // 새로운 날짜 선택
    setSelectedDate(clickedDateObj);
    
    // 선택된 날짜의 세션들을 필터링
    const sessionsForDate = calendarSessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === dateString;
    });
    
    // ClassSession을 ClassSessionWithCounts 형태로 변환
    const sessionsAsClassSessions: ClassSessionWithCounts[] = sessionsForDate.map(session => ({
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      maxStudents: session.maxStudents || 0,
      currentStudents: session.currentStudents || 0,
      enrollmentCount: session.currentStudents || 0,
      confirmedCount: session.isAlreadyEnrolled ? (session.currentStudents || 0) : 0,
      studentEnrollmentStatus: session.studentEnrollmentStatus,
      class: session.class ? {
        id: session.class.id,
        className: session.class.className,
        level: session.class.level,
        tuitionFee: session.class.tuitionFee,
        teacher: session.class.teacher
      } : undefined
    }));
    
    setSelectedSessions(sessionsAsClassSessions);
  }

  // 세션 클릭 핸들러 (기존 방식 유지)
  const handleSessionClick = (session: ClassSessionWithCounts) => {
    // ClassSessionWithCounts를 ClassSession으로 변환하여 모달에 전달
    const sessionForModal: ClassSession = {
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      maxStudents: session.maxStudents,
      currentStudents: session.currentStudents,
      studentEnrollmentStatus: session.studentEnrollmentStatus,
      class: session.class
    };
    setSelectedSession(sessionForModal)
    setIsSessionDetailModalOpen(true)
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  // 수강중인 클래스 페이지로 이동 (현재 페이지이므로 아무 동작 안 함)
  const handleEnrolledClassesClick = () => {
    // 이미 수강중인 클래스 페이지에 있으므로 아무 동작 안 함
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 상단 헤더 - 고정 */}
      <header className="flex-shrink-0 border-b border-gray-200">
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
      </header>

      {/* 캘린더 섹션 - 고정 높이 + 내부 스크롤 */}
      <div 
        className="flex-shrink-0 bg-white"
        style={{ height: 'calc(100vh - 435px)' }}
      >
        <CalendarProvider
          mode="student-view"
          sessions={calendarSessions}
          selectedSessionIds={new Set()}
          onSessionSelect={() => {}} // student-view에서는 선택 기능 없음
          onDateClick={handleDateClick}
          calendarRange={calendarRangeForCalendar}
          selectedDate={selectedDate ? selectedDate.toISOString().split('T')[0] : undefined}
        >
          <ConnectedCalendar />
        </CalendarProvider>
      </div>

      {/* 세션 카드 표시 섹션 - 하단 고정 */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col self-center w-full font-semibold leading-snug text-center max-w-[375px] mx-auto h-full">
          <SessionCardDisplay
            selectedDate={selectedDate}
            sessions={selectedSessions}
            onSessionClick={handleSessionClick}
            role="student"
          />
        </div>
      </div>

      {/* Student Session Detail Modal */}
      <StudentSessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession ? {
          session_id: selectedSession.id,
          date: selectedSession.date,
          startTime: selectedSession.startTime,
          endTime: selectedSession.endTime,
          enrollment_status: selectedSession.studentEnrollmentStatus || 'CONFIRMED',
          class: selectedSession.class ? {
            id: selectedSession.class.id,
            className: selectedSession.class.className,
            level: selectedSession.class.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
          } : {
            id: 0,
            className: '클래스명 없음',
            level: 'BEGINNER' as const
          }
        } : null}
        onClose={closeSessionDetailModal}
        onlyDetail={false}
      />
    </div>
  )
}
