'use client'

import React from 'react'

interface SessionCardProps {
  session: any
  onClick: () => void
  role: 'student' | 'teacher' | 'principal'
}

export function SessionCard({ session, onClick, role }: SessionCardProps) {
  const formatTime = (time: string | Date) => {
    const date = typeof time === 'string' ? new Date(time) : time
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }



  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'BEGINNER': '#F4E7E7',
      'INTERMEDIATE': '#FBF4D8',
      'ADVANCED': '#CBDFE3',
    }
    return levelColors[level] || '#F4E7E7'
  }

  const getLevelText = (level: string) => {
    const levelTexts: Record<string, string> = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    }
    return levelTexts[level] || '초급'
  }

  // Teacher와 Principal은 동일한 권한을 가짐
  const canManageSessions = role === 'teacher' || role === 'principal'

  return (
    <div
      className="flex flex-col p-4 mb-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
      style={{ background: getLevelColor(session.class?.level || 'BEGINNER') }}
      onClick={onClick}
    >
      {/* 날짜 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-stone-700">
          {formatDate(session.date)}
        </span>
      </div>

      {/* 시간 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-stone-600">
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </span>
        {canManageSessions && (
          <span className="text-xs text-stone-500">
            ({session.enrollmentCount}/{session.class?.maxStudents || 0}명)
          </span>
        )}
      </div>

      {/* 클래스 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-1 text-xs font-medium text-white rounded"
          style={{
            background: 'var(--Primary-Dark, linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), #573B30)',
          }}
        >
          {getLevelText(session.class?.level || 'BEGINNER')}
        </span>
        <span className="text-base font-semibold text-stone-700">
          {session.class?.className || '클래스명'}
        </span>
      </div>

      {/* 선생님 정보 (학생용) */}
      {role === 'student' && session.class?.teacher?.name && (
        <div className="text-sm text-stone-600">
          {session.class.teacher.name} 선생님
        </div>
      )}

      {/* 세션 상태 (Teacher/Principal용) */}
      {canManageSessions && (
        <div className="flex items-center gap-2 mt-2">
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