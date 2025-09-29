'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState, useMemo, useEffect } from 'react'

import { useRoleCalendarApi } from '@/hooks/calendar/useRoleCalendarApi'
import { DateSessionModal } from '@/components/common/DateSessionModal/DateSessionModal'
import { SessionDetailModal } from '@/components/common/Session/SessionDetailModal'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { useApp } from '@/contexts/AppContext'
import { toTeacherCalendarSessionVM, toTeacherSessionDetailModalVM, toClassSessionForCalendar } from '@/lib/adapters/teacher'
import type { TeacherSessionDetailModalVM } from '@/types/view/teacher'
import type { TeacherSession } from '@/types/api/teacher'
import type { ClassSession } from '@/types/api/class'

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession()
  const signOut = useSignOut()

  const { navigation } = useApp()
  const { navigateToSubPage } = navigation
  
  // API 기반 데이터 관리
  const { calendarSessions, loadSessions, isLoading, error } = useRoleCalendarApi('TEACHER')
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<TeacherSession | null>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  // 초기 데이터 로드
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 백엔드에서 받은 캘린더 범위 사용 (새로운 정책 적용)
  const calendarRange = useMemo(() => {
    // 백엔드에서 범위를 받지 못한 경우 기본값 사용 (현재 월부터 3개월)
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0), // 현재 월 + 2개월 = 3개월 범위
    };
  }, []);

  // CalendarProvider용 데이터 변환 (ClassSession 타입으로 변환)
  const classSessionsForCalendar = (calendarSessions as TeacherSession[]).map(toClassSessionForCalendar);
  
  // 세션 상세 모달 ViewModel
  const sessionDetailModalVM: TeacherSessionDetailModalVM = toTeacherSessionDetailModalVM({
    isOpen: isSessionDetailModalOpen,
    session: selectedSession ? toTeacherCalendarSessionVM(selectedSession) : null,
    onClose: () => setIsSessionDetailModalOpen(false)
  });

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
    const errorResponse = error as { response?: { status?: number } };
    if (errorResponse?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => loadSessions()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 날짜 클릭 핸들러 (ConnectedCalendar용) - API 방식
  const handleDateClick = (dateString: string) => {
    const clickedDateObj = new Date(dateString);
    setClickedDate(clickedDateObj);
    setIsDateModalOpen(true);
  }

  const closeDateModal = () => {
    setIsDateModalOpen(false)
    setClickedDate(null)
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: ClassSession) => {
    // ClassSession을 TeacherSession으로 변환하여 저장
    const teacherSession = calendarSessions.find(s => s.id === session.id) as TeacherSession
    setSelectedSession(teacherSession)
    setIsSessionDetailModalOpen(true)
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
            sessions={classSessionsForCalendar}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // teacher-view에서는 선택 기능 없음
            onDateClick={handleDateClick}
            calendarRange={calendarRange}
          >
            <ConnectedCalendar />
          </CalendarProvider>
        </div>
      </header>

      {/* Date Session Modal - API 방식 */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        role="teacher"
      />

      {/* Session Detail Modal - API 방식 */}
      <SessionDetailModal
        isOpen={sessionDetailModalVM.isOpen}
        sessionId={selectedSession?.id || null}
        onClose={sessionDetailModalVM.onClose}
        role="teacher"
      />
    </div>
  )
}
