'use client'

import React from 'react'
import { getDifficultyText, getDifficultyBgColor } from '@/utils/difficulty'
import { formatTime, formatDate } from '@/utils/dateTime'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface SessionCardProps {
  session: ClassSessionWithCounts
  onClick: () => void
  role: 'student' | 'teacher' | 'principal'
}

export function SessionCard({ session, onClick, role }: SessionCardProps) {
  // Teacher와 Principal은 동일한 권한을 가짐
  const canManageSessions = role === 'teacher' || role === 'principal'

  return (
    <div
      className="flex flex-col p-3 mb-2 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
      style={{ 
        background: getDifficultyBgColor(session.class?.level || 'BEGINNER')
      }}
      onClick={onClick}
    >
      {/* 날짜 정보 */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-medium text-stone-700">
          {formatDate(session.date, { includeWeekday: true })}
        </span>
      </div>

      {/* 시간 정보 */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-medium text-stone-600">
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </span>
        {canManageSessions && (
          <span className="text-xs text-stone-500">
            ({session.enrollmentCount}/{session.maxStudents || 0}명)
          </span>
        )}
      </div>

      {/* 클래스 정보 */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="px-2 py-0.5 text-xs font-medium text-white rounded"
          style={{
            background: 'var(--Primary-Dark, linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), #573B30)',
          }}
        >
          {getDifficultyText(session.class?.level || 'BEGINNER')}
        </span>
        <span className="text-base font-semibold text-stone-700">
          {session.class?.className || '클래스명'}
        </span>
      </div>

      {/* 선생님 정보 (학생용) */}
      {role === 'student' && session.class?.teacher?.name && (
        <div className="text-sm text-stone-600 text-left">
          {session.class.teacher.name} 선생님
        </div>
      )}

      {/* 세션 상태 (Teacher/Principal용) */}
      {canManageSessions && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-stone-500">
            확정: {session.confirmedCount}명
          </span>
          <span className="text-xs text-stone-500">
            대기: {session.enrollmentCount - session.confirmedCount}명
          </span>
        </div>
      )}
    </div>
  )
} 