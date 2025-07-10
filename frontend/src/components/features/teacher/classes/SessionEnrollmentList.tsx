'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEnrollmentStatus, batchUpdateEnrollmentStatus } from '@/api/class-sessions'
import { toast } from 'sonner'

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
}

export const SessionEnrollmentList: React.FC<SessionEnrollmentListProps> = ({
  sessionEnrollments,
  isLoading,
  session,
}) => {
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: number; status: string }) =>
      updateEnrollmentStatus(enrollmentId, { status: status as any }),
    onSuccess: () => {
      toast.success('수강신청 상태가 변경되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['session-enrollments', session.id] })
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] })
    },
    onError: (error) => {
      toast.error('상태 변경에 실패했습니다.')
      console.error('Update enrollment status error:', error)
    },
  })

  const updateBatchStatusMutation = useMutation({
    mutationFn: ({ enrollmentIds, status }: { enrollmentIds: number[]; status: string }) =>
      batchUpdateEnrollmentStatus({ enrollmentIds, status: status as any }),
    onSuccess: () => {
      toast.success('선택된 수강신청 상태가 변경되었습니다.')
      setSelectedEnrollments([])
      setSelectAll(false)
      queryClient.invalidateQueries({ queryKey: ['session-enrollments', session.id] })
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] })
    },
    onError: (error) => {
      toast.error('배치 상태 변경에 실패했습니다.')
      console.error('Update batch enrollment status error:', error)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!sessionEnrollments || sessionEnrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-stone-500 text-center">이 세션에 수강신청한 학생이 없습니다.</p>
      </div>
    )
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': '대기중',
      'CONFIRMED': '승인됨',
      'REJECTED': '거절됨',
      'CANCELLED': '취소됨',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-green-100 text-green-700',
      'REJECTED': 'bg-red-100 text-red-700',
      'CANCELLED': 'bg-gray-100 text-gray-600',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-600'
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEnrollments([])
      setSelectAll(false)
    } else {
      setSelectedEnrollments(sessionEnrollments.map(e => e.id))
      setSelectAll(true)
    }
  }

  const handleSelectEnrollment = (enrollmentId: number) => {
    setSelectedEnrollments(prev => {
      if (prev.includes(enrollmentId)) {
        const newSelected = prev.filter(id => id !== enrollmentId)
        setSelectAll(false)
        return newSelected
      } else {
        const newSelected = [...prev, enrollmentId]
        setSelectAll(newSelected.length === sessionEnrollments.length)
        return newSelected
      }
    })
  }

  const handleStatusChange = (enrollmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ enrollmentId, status: newStatus })
  }

  const handleBatchStatusChange = (status: string) => {
    if (selectedEnrollments.length === 0) {
      toast.error('선택된 수강신청이 없습니다.')
      return
    }
    updateBatchStatusMutation.mutate({ enrollmentIds: selectedEnrollments, status })
  }

  const pendingEnrollments = sessionEnrollments.filter(e => e.status === 'PENDING')
  const confirmedEnrollments = sessionEnrollments.filter(e => e.status === 'CONFIRMED')

  return (
    <div className="space-y-4">
      {/* 배치 작업 도구 */}
      {sessionEnrollments.length > 0 && (
        <div className="bg-stone-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-stone-300"
                />
                <span className="text-sm font-medium">전체 선택</span>
              </label>
              {selectedEnrollments.length > 0 && (
                <span className="text-sm text-stone-600">
                  {selectedEnrollments.length}개 선택됨
                </span>
              )}
            </div>
            {selectedEnrollments.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBatchStatusChange('CONFIRMED')}
                  disabled={updateBatchStatusMutation.isPending}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  승인
                </button>
                <button
                  onClick={() => handleBatchStatusChange('REJECTED')}
                  disabled={updateBatchStatusMutation.isPending}
                  className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  거절
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 대기중인 수강신청 */}
      {pendingEnrollments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-3">
            대기중인 수강신청 ({pendingEnrollments.length}명)
          </h3>
          <div className="space-y-3">
            {pendingEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEnrollments.includes(enrollment.id)}
                    onChange={() => handleSelectEnrollment(enrollment.id)}
                    className="rounded border-stone-300"
                  />
                  <div>
                    <h4 className="font-medium text-stone-700">{enrollment.student.name}</h4>
                    <p className="text-sm text-stone-600">{enrollment.student.phoneNumber}</p>
                    {enrollment.student.email && (
                      <p className="text-sm text-stone-500">{enrollment.student.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(enrollment.id, 'CONFIRMED')}
                    disabled={updateStatusMutation.isPending}
                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleStatusChange(enrollment.id, 'REJECTED')}
                    disabled={updateStatusMutation.isPending}
                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 승인된 수강신청 */}
      {confirmedEnrollments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-3">
            승인된 수강생 ({confirmedEnrollments.length}명)
          </h3>
          <div className="space-y-3">
            {confirmedEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEnrollments.includes(enrollment.id)}
                    onChange={() => handleSelectEnrollment(enrollment.id)}
                    className="rounded border-stone-300"
                  />
                  <div>
                    <h4 className="font-medium text-stone-700">{enrollment.student.name}</h4>
                    <p className="text-sm text-stone-600">{enrollment.student.phoneNumber}</p>
                    {enrollment.student.email && (
                      <p className="text-sm text-stone-500">{enrollment.student.email}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(enrollment.status)}`}>
                  {getStatusText(enrollment.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기타 상태의 수강신청 */}
      {sessionEnrollments.filter(e => e.status !== 'PENDING' && e.status !== 'CONFIRMED').length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-3">기타</h3>
          <div className="space-y-3">
            {sessionEnrollments
              .filter(e => e.status !== 'PENDING' && e.status !== 'CONFIRMED')
              .map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEnrollments.includes(enrollment.id)}
                      onChange={() => handleSelectEnrollment(enrollment.id)}
                      className="rounded border-stone-300"
                    />
                    <div>
                      <h4 className="font-medium text-stone-700">{enrollment.student.name}</h4>
                      <p className="text-sm text-stone-600">{enrollment.student.phoneNumber}</p>
                      {enrollment.student.email && (
                        <p className="text-sm text-stone-500">{enrollment.student.email}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(enrollment.status)}`}>
                    {getStatusText(enrollment.status)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
} 