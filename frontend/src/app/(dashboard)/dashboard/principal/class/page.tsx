'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { usePrincipalCalendarApi } from '@/hooks/calendar/usePrincipalCalendarApi'
import { DateSessionModal } from '@/components/common/DateSessionModal/DateSessionModal'
import { SessionDetailModal } from '@/components/common/Session/SessionDetailModal'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { toClassSessionForCalendar } from '@/lib/adapters/principal'
import type { PrincipalClassSession } from '@/types/api/principal'
import type { ClassSession } from '@/types/api/class'

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
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const { navigateToSubPage } = useDashboardNavigation()
  
  // API 기반 데이터 관리
  const { calendarSessions, loadSessions, isLoading, error } = usePrincipalCalendarApi()
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<PrincipalClassSession | null>(null)
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
      signOut({ redirect: true, callbackUrl: '/auth' });
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
    // ClassSession을 PrincipalClassSession으로 변환하여 저장
    const principalSession = calendarSessions.find(s => s.id === session.id) as PrincipalClassSession
    setSelectedSession(principalSession)
    setIsSessionDetailModalOpen(true)
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  // 전체 클래스 SubPage로 이동
  const handlePrincipalClassesClick = () => {
    navigateToSubPage('principal-all-classes')
  }

  // 강의 개설 SubPage로 이동
  const handleCreateClassClick = () => {
    navigateToSubPage('create-class')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
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

        {/* 캘린더 섹션 - 기존 크기 복원 */}
        <div className="flex flex-col w-full bg-white text-stone-700" style={{ height: 'calc(100vh - 450px)' }}>
          <CalendarProvider
            mode="teacher-view"
            sessions={calendarSessions.map(toClassSessionForCalendar)}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // principal-view에서는 선택 기능 없음
            onDateClick={handleDateClick}
            calendarRange={calendarRange}
          >
            <ConnectedCalendar />
          </CalendarProvider>
        </div>

        {/* 강의 개설 버튼 섹션 */}
        <div className="flex flex-col px-5 py-4 border-t border-gray-200">
          <div className="flex flex-col self-center w-full font-semibold leading-snug text-center max-w-[335px]">
            <CreateClassCard
              title="강의 개설"
              description="새로운 강의를 개설하고 선생님을 배정하세요"
              onClick={handleCreateClassClick}
            />
          </div>
        </div>
      </header>

      {/* Date Session Modal - API 방식 */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        role="principal"
      />

      {/* Session Detail Modal - API 방식 */}
      <SessionDetailModal
        isOpen={isSessionDetailModalOpen}
        sessionId={selectedSession?.id || null}
        onClose={closeSessionDetailModal}
        role="principal"
      />
    </div>
  )
} 