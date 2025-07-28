'use client'

import React from 'react'

interface SessionEnrollment {
  id: number
  sessionId: number
  studentId: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  student: {
    id: number
    name: string
    phoneNumber: string
    email?: string
    level?: string
  }
  createdAt: string
}

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

interface SessionEnrollmentListProps {
  sessionEnrollments: SessionEnrollment[]
  isLoading: boolean
  session: Session
  role: 'teacher' | 'principal'
}

export const SessionEnrollmentList: React.FC<SessionEnrollmentListProps> = ({
  sessionEnrollments,
  isLoading,
  session,
  role
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!sessionEnrollments || sessionEnrollments.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>수강생이 없습니다.</p>
      </div>
    )
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '대기',
      'CONFIRMED': '확정',
      'CANCELLED': '취소',
      'REJECTED': '거절'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CONFIRMED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'REJECTED': 'text-gray-600 bg-gray-100'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-stone-700">
          수강생 목록 ({sessionEnrollments.length}명)
        </h3>
        <div className="text-sm text-stone-500">
          {session.class.className} - {new Date(session.date).toLocaleDateString('ko-KR')}
        </div>
      </div>
      
      <div className="space-y-3">
        {sessionEnrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-stone-700">
                {enrollment.student.name}
              </div>
              {enrollment.student.phoneNumber && (
                <div className="text-sm text-stone-500">
                  {enrollment.student.phoneNumber}
                </div>
              )}
              {enrollment.student.level && (
                <div className="text-xs text-stone-400">
                  레벨: {enrollment.student.level}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded ${getStatusColor(enrollment.status)}`}
              >
                {getStatusText(enrollment.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 