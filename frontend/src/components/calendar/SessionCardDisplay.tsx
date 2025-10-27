'use client'

import React from 'react'
import { SessionCard } from '@/components/common/Session/SessionCard'
import { EmptySessionDisplay } from './EmptySessionDisplay'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface SessionCardDisplayProps {
  selectedDate: Date | null
  sessions: ClassSessionWithCounts[]
  onSessionClick: (session: ClassSessionWithCounts) => void
  role: 'student' | 'teacher' | 'principal'
}

export function SessionCardDisplay({ 
  selectedDate, 
  sessions, 
  onSessionClick, 
  role 
}: SessionCardDisplayProps) {
  // 세션들을 시간순으로 정렬
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime()
      const timeB = new Date(b.startTime).getTime()
      return timeA - timeB
    })
  }, [sessions])

  // 선택된 날짜가 없으면 빈 상태 표시
  if (!selectedDate) {
    return <EmptySessionDisplay />
  }

  // 세션이 없는 경우
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
      <div className="h-full overflow-y-auto">
        <span className="text-base font-semibold text-stone-700">
          {role === 'student' ? '세션 정보 보기' : '클래스 출석부 관리'}
        </span>
      <div className="space-y-3 pb-6 max-h-96">
        {sortedSessions.map((session, index) => (
          <SessionCard
            key={`${session.id}-${index}`}
            session={session}
            onClick={() => onSessionClick(session)}
            role={role}
          />
        ))}
      </div>
    </div>
  )
}
