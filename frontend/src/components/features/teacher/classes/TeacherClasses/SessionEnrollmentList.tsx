'use client'

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import { toast } from 'sonner'
import { toSessionEnrollmentDisplayVM } from '@/lib/adapters/teacher'
import { SessionEnrollmentDisplayVM } from '@/types/view/teacher'
import { SessionEnrollment, TeacherSession } from '@/types/api/teacher'
import { EnrollmentStatus } from '@/types/api/common'

interface EnrolledStudentCardListProps {
  sessionEnrollments: SessionEnrollmentDisplayVM[]
  isLoading: boolean
  session: TeacherSession
  onStatusChange: (enrollmentId: number, status: string) => void
  isUpdating?: boolean
}

const EnrolledStudentCardList: React.FC<EnrolledStudentCardListProps> = ({
  sessionEnrollments,
  isLoading,
  onStatusChange,
  isUpdating,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }
  if (!sessionEnrollments?.length) {
    return <div className="text-center text-stone-500 py-6">수강신청 내역이 없습니다.</div>
  }
  return (
    <div className="space-y-3">
      {sessionEnrollments.map((enroll) => (
        <div key={enroll.id} className="p-3 border rounded-lg bg-white flex items-center justify-between">
          <div>
            <div className="font-medium text-stone-800">{enroll.student.name}</div>
            <div className="text-sm text-stone-500">{enroll.student.phoneNumber}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={enroll.status}
              onChange={(e) => onStatusChange(enroll.id, e.target.value)}
              disabled={isUpdating}
            >
              <option value="PENDING">대기</option>
              <option value="CONFIRMED">승인</option>
              <option value="REJECTED">거절</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

interface SessionEnrollmentListProps {
  sessionEnrollments: SessionEnrollment[]
  isLoading: boolean
  session: TeacherSession
}

export const SessionEnrollmentList: React.FC<SessionEnrollmentListProps> = ({
  sessionEnrollments,
  isLoading,
  session,
}) => {
  const queryClient = useQueryClient()
  const teacherApi = useTeacherApi()

  // ViewModel로 변환 (실제로 사용하는 것만)
  const enrollmentVMs: SessionEnrollmentDisplayVM[] = sessionEnrollments.map(toSessionEnrollmentDisplayVM)

  const updateStatusMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: number; status: EnrollmentStatus }) =>
      teacherApi.updateEnrollmentStatus(enrollmentId, { status }),
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

  const handleStatusChange = (enrollmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ enrollmentId, status: newStatus as EnrollmentStatus })
  }

  return (
    <EnrolledStudentCardList
      sessionEnrollments={enrollmentVMs}
      isLoading={isLoading}
      session={session}
      onStatusChange={handleStatusChange}
      isUpdating={updateStatusMutation.isPending}
    />
  )
} 