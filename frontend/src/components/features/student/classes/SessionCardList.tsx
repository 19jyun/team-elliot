import React from 'react'
import { SessionCard } from './SessionCard'

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
  }
  session_id: number
  enrollment_status: string
  enrollment_id: number
}

// API 응답 타입과 호환되도록 any 타입도 허용
type SessionData = Session | any

interface SessionCardListProps {
  sessions: SessionData[]
  onSessionClick: (session: SessionData) => void
}

export const SessionCardList: React.FC<SessionCardListProps> = ({ 
  sessions, 
  onSessionClick 
}) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>등록된 세션이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {sessions.map((session: any) => (
        <SessionCard
          key={`${session.session_id}-${session.enrollment_id}`}
          session={session}
          onClick={() => onSessionClick(session)}
        />
      ))}
    </div>
  )
} 