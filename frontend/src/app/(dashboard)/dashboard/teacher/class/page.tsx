'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState, useMemo, useCallback } from 'react'

import { useTeacherCalendarSessions } from '@/hooks/queries/teacher/useTeacherCalendarSessions'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { SessionCardDisplay } from '@/components/calendar/SessionCardDisplay'
import { toClassSessionForCalendar } from '@/lib/adapters/teacher'
import type { TeacherSession } from '@/types/api/teacher'
import type { ClassSessionWithCounts } from '@/types/api/class'
import { useRouter } from 'next/navigation'
import { ensureTrailingSlash } from '@/lib/utils/router'
import { useApp } from '@/contexts'

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession()
  const signOut = useSignOut()
  const router = useRouter()
  const { setSelectedSessionId } = useApp()

  // React Query 기반 데이터 관리
  const { data: calendarSessionsData, isLoading, error, refetch } = useTeacherCalendarSessions();
  const calendarSessions = useMemo(
    () => (calendarSessionsData as TeacherSession[]) || [],
    [calendarSessionsData]
  );
  
  // 선택된 날짜와 세션 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<ClassSessionWithCounts[]>([])
  
  // 선택된 날짜 문자열 (YYYY-MM-DD 형식)
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null

  // 캘린더 범위 계산 (현재 월부터 3개월)
  const calendarRangeForCalendar = useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    };
  }, []);

  // 날짜별 세션 조회 헬퍼 함수
  const getSessionsByDate = useCallback((date: Date): TeacherSession[] => {
    return calendarSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  }, [calendarSessions]);

  // CalendarProvider용 데이터 변환 (ClassSession 타입으로 변환)
  const classSessionsForCalendar = useMemo(() => {
    return calendarSessions.map(toClassSessionForCalendar);
  }, [calendarSessions]);

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
          onClick={() => refetch()}
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
    const sessionsWithCounts = sessions.map((session: TeacherSession) => {
      // TeacherSession 타입인지 확인
      if ('enrollmentCount' in session && 'confirmedCount' in session && 'class' in session) {
        return {
          ...session,
          enrollmentCount: session.enrollmentCount || 0,
          confirmedCount: session.confirmedCount || 0,
          sessionSummary: session.sessionSummary || null,
          class: {
            ...session.class,
            tuitionFee: '50000', // 기본값 설정
          },
        } as ClassSessionWithCounts;
      }
      // 다른 타입인 경우 기본값 사용
      const sessionObj = session as Record<string, unknown>;
      return {
        ...sessionObj,
        enrollmentCount: 0,
        confirmedCount: 0,
        sessionSummary: null,
        class: {
          id: sessionObj.classId || 0,
          className: 'Unknown Class',
          level: 'BEGINNER',
          tuitionFee: '50000',
        },
      } as ClassSessionWithCounts;
    });
    
    setSelectedSessions(sessionsWithCounts);
  }

  // 세션 클릭 핸들러 - 쿼리 파라미터로 이동
  const handleSessionClick = (session: ClassSessionWithCounts) => {
    // Context에 선택된 세션 ID 저장
    setSelectedSessionId(session.id)
    
    // 쿼리 파라미터 없이 세션 상세 페이지로 이동 (Context에서 데이터 조회)
    router.push(ensureTrailingSlash(`/dashboard/teacher/class/session-detail/`));
  }


  // 담당 클래스 페이지로 이동 (현재 페이지이므로 아무 동작 안 함)
  const handleTeacherClassesClick = () => {
    // 이미 담당 클래스 페이지에 있으므로 아무 동작 안 함
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 상단 헤더 - 고정 */}
      <header className="flex-shrink-0 border-b border-gray-200">
        {/* 환영 메시지 + 캘린더 아이콘 버튼 */}
        <div className="flex flex-col px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-stone-700">
                안녕하세요, {session?.user?.name}님!
              </h1>
              <p className="mt-2 text-stone-500 text-sm">오늘도 즐거운 수업되세요!</p>
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
      </header>

      {/* 캘린더 섹션 - 고정 높이 + 내부 스크롤 */}
      <div 
        className="flex-shrink-0 bg-white"
        style={{ height: 'calc(100vh - 435px)' }}
      >
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

      {/* 세션 카드 표시 섹션 - 하단 고정 */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col self-center w-full font-semibold leading-snug text-center max-w-[375px] mx-auto h-full">
          <SessionCardDisplay
            selectedDate={selectedDate}
            sessions={selectedSessions}
            onSessionClick={handleSessionClick}
            role="teacher"
          />
        </div>
      </div>
    </div>
  )
}
