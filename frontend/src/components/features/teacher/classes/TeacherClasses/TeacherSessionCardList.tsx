import React from 'react'

interface Session {
  id: number
  classId: number
  date: string
  startTime: string
  endTime: string
  class: {
    id: number
    className: string
    level?: string
    maxStudents?: number
  }
  enrollmentCount: number
  confirmedCount: number
}

interface TeacherSessionCardListProps {
  sessions: Session[]
  onSessionClick: (session: Session) => void
  isLoading: boolean
}

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

export const TeacherSessionCardList: React.FC<TeacherSessionCardListProps> = ({
  sessions,
  onSessionClick,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center py-8 flex-1">
          <p className="text-stone-500 text-center">등록된 세션이 없습니다.</p>
        </div>
      </div>
    )
  }

  const getEnrollmentCounts = (session: any) => {
    // session.enrollmentCount와 session.confirmedCount가 이미 백엔드에서 계산되어 전달됨
    return {
      enrollmentCount: session.enrollmentCount || 0,
      confirmedCount: session.confirmedCount || 0
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-col gap-3 pb-4">
          {sessions.map((session) => {
            const { enrollmentCount } = getEnrollmentCounts(session)
            
            // level 타입 보정
            const safeLevel: LevelType =
              session.class?.level === 'INTERMEDIATE' || session.class?.level === 'ADVANCED' 
                ? session.class.level 
                : 'BEGINNER'

            return (
              <div
                key={session.id}
                className="relative flex flex-col p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
                style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
                onClick={() => onSessionClick(session)}
              >
                {/* 날짜 정보 */}
                <div style={{
                  color: 'var(--Primary-Dark, #573B30)',
                  fontFamily: 'Pretendard Variable',
                  fontSize: 16,
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '140%',
                  letterSpacing: '-0.16px',
                  marginBottom: '8px',
                }}>
                  {new Date(session.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
                
                {/* 시간 정보 */}
                <div style={{
                  color: 'var(--Primary-Dark, #573B30)',
                  fontFamily: 'Pretendard Variable',
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '140%',
                  letterSpacing: '-0.14px',
                }}>
                  {new Date(session.startTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(session.endTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {/* 학생수 정보 - 우측 세로 정렬 */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div style={{
                    color: 'var(--Primary-Dark, #573B30)',
                    textAlign: 'center',
                    fontFamily: 'Pretendard Variable',
                    fontSize: 12,
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '140%',
                    letterSpacing: '-0.12px',
                  }}>
                    {enrollmentCount}/{session.class?.maxStudents || '?'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 