import React from 'react'

interface SessionCardProps {
  session: {
    session_id: number
    enrollment_id: number
    date: string
    startTime: string
    endTime: string
    enrollment_status: string
    class?: {
      level?: string
    }
  }
  onClick: () => void
}

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '대기중'
    case 'CONFIRMED':
      return '확정'
    case 'CANCELLED':
      return '취소'
    default:
      return status
  }
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  // level 타입 보정
  const safeLevel: LevelType =
    session.class?.level === 'INTERMEDIATE' || session.class?.level === 'ADVANCED' 
      ? session.class.level 
      : 'BEGINNER'

  return (
    <div
      className="relative flex flex-col p-4 mb-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
      onClick={onClick}
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
      
      {/* 상태 정보 - 우측 세로 정렬 */}
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
          {getStatusText(session.enrollment_status)}
        </div>
      </div>
    </div>
  )
} 