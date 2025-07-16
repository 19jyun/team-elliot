'use client'

import React from 'react'
import { SessionCard } from './SessionCard'

interface SessionCardListProps {
  sessions: any[]
  onSessionClick: (session: any) => void
  userRole: 'student' | 'teacher'
}

export function SessionCardList({ sessions, onSessionClick, userRole }: SessionCardListProps) {
  // 세션들을 시간순으로 정렬
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime()
      const timeB = new Date(b.startTime).getTime()
      return timeA - timeB
    })
  }, [sessions])

  if (sortedSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-stone-400 text-lg mb-2">📅</div>
        <p className="text-stone-500 text-sm">
          이 날에는 수업이 없습니다
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedSessions.map((session, index) => (
        <SessionCard
          key={`${session.id}-${index}`}
          session={session}
          onClick={() => onSessionClick(session)}
          userRole={userRole}
        />
      ))}
    </div>
  )
} 