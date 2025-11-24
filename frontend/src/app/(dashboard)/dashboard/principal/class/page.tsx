'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState, useMemo } from 'react'
import { ensureTrailingSlash } from '@/lib/utils/router'
import { usePrincipalCalendarSessions } from '@/hooks/queries/principal/usePrincipalCalendarSessions'
import { DateSessionModal } from '@/components/common/DateSessionModal/DateSessionModal'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { toClassSessionForCalendar } from '@/lib/adapters/principal'
import type { PrincipalClassSession } from '@/types/api/principal'
import type { ClassSession } from '@/types/api/class'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts'

// 강의 개설 카드 컴포넌트
const CreateClassCard: React.FC<{
  title: string
  description?: string
  isNew?: boolean
  onClick: () => void
}> = ({ title, description, isNew, onClick }) => (
  <div
    className="flex gap-10 justify-between items-center py-4 pr-4 pl-5 w-full text-base tracking-normal rounded-lg bg-stone-200 text-stone-700 cursor-pointer hover:bg-stone-400 transition-colors duration-200"
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    <div className="flex flex-col gap-1.5 items-start self-stretch my-auto">
      <div className="flex gap-1.5 items-center">
        {isNew && (
          <div className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            NEW
          </div>
        )}
        <div className="text-base font-medium tracking-normal text-stone-700">
          {title}
        </div>
      </div>
      <div className="text-sm text-stone-600">
        {description}
      </div>
    </div>
    <div className="shrink-0 self-stretch my-auto w-4 aspect-square flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-600"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
)

export default function PrincipalClassPage() {
  const signOut = useSignOut()
  const router = useRouter()
  const { resetPrincipalCreateClass } = useApp()

  const { data: session, status } = useSession()

  // React Query 기반 데이터 관리
  const { data: calendarSessionsData, isLoading, error, refetch } = usePrincipalCalendarSessions();
  const calendarSessions = (calendarSessionsData || []) as PrincipalClassSession[];
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  
  // 캘린더 범위 계산 (현재 월부터 3개월)
  const calendarRangeForCalendar = useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    };
  }, []);

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
          onClick={() => refetch()}
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

  // 세션 클릭 핸들러 - 서브페이지로 이동
  const handleSessionClick = (session: ClassSession) => {
    // DateSessionModal 닫기
    closeDateModal()
    
    // 쿼리 파라미터로 세션 상세 페이지로 이동 (React Query 캐시에서 데이터 조회)
    router.push(ensureTrailingSlash(`/dashboard/principal/class/session-detail?id=${session.id}`))
  }


  // 전체 클래스 페이지로 이동 (현재 페이지이므로 아무 동작 안 함)
  const handlePrincipalClassesClick = () => {
    // 이미 전체 클래스 페이지에 있으므로 아무 동작 안 함
  }

  // 강의 개설 페이지로 이동
  const handleCreateClassClick = () => {
    resetPrincipalCreateClass()
    router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info'))
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
                안녕하세요, {session?.user?.name} 원장님!
              </h1>
              <p className="mt-2 text-stone-500">학원의 모든 강의를 한눈에 확인하세요!</p>
            </div>
            {/* 캘린더 아이콘 버튼 */}
            <button
              onClick={handlePrincipalClassesClick}
              className="flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
              aria-label="전체 클래스 보기"
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
        style={{ height: 'calc(100vh - 350px)' }}
      >
        <CalendarProvider
          mode="teacher-view"
          sessions={calendarSessions.map(toClassSessionForCalendar)}
          selectedSessionIds={new Set()}
          onSessionSelect={() => {}} // principal-view에서는 선택 기능 없음
          onDateClick={handleDateClick}
          calendarRange={calendarRangeForCalendar}
        >
          <ConnectedCalendar />
        </CalendarProvider>
      </div>

      {/* 강의 개설 버튼 - 하단 고정 */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col self-center w-full font-semibold leading-snug text-center max-w-[375px] mx-auto">
          <CreateClassCard
            title="강의 개설"
            description="새로운 강의를 개설하고 선생님을 배정하세요"
            onClick={handleCreateClassClick}
          />
        </div>
      </div>

      {/* Date Session Modal - API 방식 */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        role="principal"
        session={session}
      />
    </div>
  )
} 