import React from 'react'
import { SessionCard } from './SessionCard'
import type { StudentEnrolledSessionVM } from '@/types/view/student'

interface SessionCardListProps {
  sessions: StudentEnrolledSessionVM[]
  onSessionClick: (session: StudentEnrolledSessionVM) => void
}

export const SessionCardList: React.FC<SessionCardListProps> = ({ 
  sessions, 
  onSessionClick 
}) => {
  // REFUND_CANCELLED, CANCELLED, TEACHER_CANCELLED 상태 제외
  const filteredSessions = sessions.filter(
    (session) =>
      !['REFUND_CANCELLED', 'CANCELLED', 'TEACHER_CANCELLED'].includes(session.enrollment_status)
  );

  if (filteredSessions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center py-8 flex-1">
          <p className="text-stone-500 text-center">등록된 세션이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-col gap-3 pb-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={`${session.session_id}-${session.enrollment_id}`}
              session={session}
              onClick={() => onSessionClick(session)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 