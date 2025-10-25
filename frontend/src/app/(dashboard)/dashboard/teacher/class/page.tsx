'use client'

import { Session, useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState, useMemo, useEffect } from 'react'

import { useTeacherCalendarApi } from '@/hooks/calendar/useTeacherCalendarApi'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { SessionCardDisplay } from '@/components/calendar/SessionCardDisplay'
import { useApp } from '@/contexts/AppContext'
import { toClassSessionForCalendar } from '@/lib/adapters/teacher'
import { useRoleCalendarApi } from '@/hooks/calendar/useRoleCalendarApi'
import type { TeacherSession } from '@/types/api/teacher'
import type { ClassSession, ClassSessionWithCounts } from '@/types/api/class'

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession()
  const signOut = useSignOut()

  const { navigation, data } = useApp()
  const { navigateToSubPage } = navigation
  
  // API 기반 데이터 관리 (Redux 기반)
  const { calendarSessions, calendarRange, loadSessions, isLoading, error } = useTeacherCalendarApi(session as Session)
  
  // Role별 API 기반 데이터 관리
  const { getSessionsByDate } = useRoleCalendarApi('TEACHER', session);
  
  // 선택된 날짜와 세션 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<ClassSessionWithCounts[]>([])
  
  // 선택된 날짜 문자열 (YYYY-MM-DD 형식)
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null

  // 초기 데이터 로드
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Redux에서 가져온 캘린더 범위를 Date 객체로 변환
  const calendarRangeForCalendar = useMemo(() => {
    if (calendarRange) {
      return {
        startDate: new Date(calendarRange.startDate),
        endDate: new Date(calendarRange.endDate),
      };
    }
    // 기본값 사용 (현재 월부터 3개월)
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    };
  }, [calendarRange]);

  // CalendarProvider용 데이터 변환 (ClassSession 타입으로 변환)
  const classSessionsForCalendar = (calendarSessions as TeacherSession[]).map(toClassSessionForCalendar);

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

  // 날짜 클릭 핸들러 (ConnectedCalendar용) - 선택/해제 기능
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
    
    // 선택된 날짜의 세션들을 가져와서 상태 업데이트
    const sessions = getSessionsByDate(clickedDateObj);
    const sessionsWithCounts = sessions.map((session) => {
      // TeacherSession 타입인지 확인
      if ('enrollmentCount' in session && 'confirmedCount' in session && 'class' in session) {
        return {
          ...session,
          enrollmentCount: session.enrollmentCount || 0,
          confirmedCount: session.confirmedCount || 0,
          class: {
            ...session.class,
            tuitionFee: '50000', // 기본값 설정
          },
        } as ClassSessionWithCounts;
      }
      // 다른 타입인 경우 기본값 사용
      return {
        ...session,
        enrollmentCount: 0,
        confirmedCount: 0,
        class: {
          id: session.classId || 0,
          className: 'Unknown Class',
          level: 'BEGINNER',
          tuitionFee: '50000',
        },
      } as ClassSessionWithCounts;
    });
    
    setSelectedSessions(sessionsWithCounts);
  }

  // 세션 클릭 핸들러 - 서브페이지로 이동
  const handleSessionClick = (session: ClassSessionWithCounts) => {
    // 세션 정보를 DataContext에 저장
    data.setCache('selectedSession', session);
    
    // 서브페이지로 이동
    navigateToSubPage('session-detail');
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
        <div className="flex flex-col w-full bg-white text-stone-700" style={{ height: 'calc(100vh - 500px)' }}>
          <CalendarProvider
            mode="teacher-view"
            sessions={classSessionsForCalendar}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // teacher-view에서는 선택 기능 없음
            onDateClick={handleDateClick}
            calendarRange={calendarRangeForCalendar}
            selectedDate={selectedDateString}
          >
            <ConnectedCalendar />
          </CalendarProvider>
        </div>
      </header>

      {/* 세션 카드 표시 섹션 */}
      <div className="flex-1 bg-white px-5 py-4">
        <SessionCardDisplay
          selectedDate={selectedDate}
          sessions={selectedSessions}
          onSessionClick={handleSessionClick}
          role="teacher"
        />
      </div>
    </div>
  )
}
