import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { batchUpdateEnrollmentStatus } from '@/api/class-sessions'
import { toast } from 'sonner'
import { EnrolledStudentCard } from './EnrolledStudentCard'

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

interface EnrolledStudentCardListProps {
  sessionEnrollments: SessionEnrollment[]
  isLoading: boolean
  session: Session
  onStatusChange: (enrollmentId: number, status: string) => void
  isUpdating: boolean
}

export const EnrolledStudentCardList: React.FC<EnrolledStudentCardListProps> = ({
  sessionEnrollments,
  isLoading,
  session,
  onStatusChange,
  isUpdating
}) => {
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const queryClient = useQueryClient()

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
      <div className="text-center py-8 text-stone-500">
        <p>수강생이 없습니다.</p>
      </div>
    )
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

  const handleBatchStatusChange = (status: string) => {
    if (selectedEnrollments.length === 0) {
      toast.error('선택된 수강신청이 없습니다.')
      return
    }
    updateBatchStatusMutation.mutate({ enrollmentIds: selectedEnrollments, status })
  }

  const pendingEnrollments = sessionEnrollments.filter(e => e.status === 'PENDING')
  const confirmedEnrollments = sessionEnrollments.filter(e => e.status === 'CONFIRMED')
  const otherEnrollments = sessionEnrollments.filter(e => e.status !== 'PENDING' && e.status !== 'CONFIRMED')

  return (
    <div className="space-y-4">

      {/* 배치 작업 도구 */}
      {sessionEnrollments.length > 0 && (
        <div className="bg-stone-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
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
              <EnrolledStudentCard
                key={enrollment.id}
                enrollment={enrollment}
                isSelected={selectedEnrollments.includes(enrollment.id)}
                onSelect={handleSelectEnrollment}
                onStatusChange={onStatusChange}
                isUpdating={isUpdating}
              />
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
              <EnrolledStudentCard
                key={enrollment.id}
                enrollment={enrollment}
                isSelected={selectedEnrollments.includes(enrollment.id)}
                onSelect={handleSelectEnrollment}
                onStatusChange={onStatusChange}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </div>
      )}

      {/* 기타 상태의 수강신청 */}
      {otherEnrollments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-3">기타</h3>
          <div className="space-y-3">
            {otherEnrollments.map((enrollment) => (
              <EnrolledStudentCard
                key={enrollment.id}
                enrollment={enrollment}
                isSelected={selectedEnrollments.includes(enrollment.id)}
                onSelect={handleSelectEnrollment}
                onStatusChange={onStatusChange}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 