'use client'

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
  enrollmentCount: number
  confirmedCount: number
}

interface SessionCardListProps {
  sessions: Session[]
  onSessionClick: (session: Session) => void
  isLoading: boolean
  role: 'teacher' | 'principal'
}

export const SessionCardList: React.FC<SessionCardListProps> = ({
  sessions,
  onSessionClick,
  isLoading,
  role
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

  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-col gap-3 pb-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => onSessionClick(session)}
              role={role}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 