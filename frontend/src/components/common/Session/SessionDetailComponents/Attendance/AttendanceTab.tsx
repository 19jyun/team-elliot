'use client'

import React from 'react'

interface AttendanceTabProps {
  sessionId: number
  enrollments: Array<{
    id: number
    status?: string
    student?: { name?: string; phoneNumber?: string }
  }>
  isLoading?: boolean
}

export function AttendanceTab({ sessionId, enrollments, isLoading = false }: AttendanceTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">수강생 정보가 없습니다.</div>
    )
  }

  return (
    <div className="space-y-3">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
        >
          <div className="flex-1 overflow-hidden">
            <div className="font-medium text-stone-700 truncate">
              {enrollment.student?.name || '수강생'}
            </div>
            {enrollment.student?.phoneNumber && (
              <div className="text-sm text-stone-500 truncate">
                {enrollment.student.phoneNumber}
              </div>
            )}
          </div>
          <div className="ml-3 text-xs text-stone-600">
            {enrollment.status || '상태 미정'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttendanceTab


