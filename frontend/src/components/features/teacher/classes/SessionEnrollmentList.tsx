'use client'

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEnrollmentStatus } from '@/api/class-sessions'
import { toast } from 'sonner'
import { EnrolledStudentCardList } from './EnrolledStudentCardList'

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
}

export const SessionEnrollmentList: React.FC<SessionEnrollmentListProps> = ({
  sessionEnrollments,
  isLoading,
  session,
}) => {
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

  const handleStatusChange = (enrollmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ enrollmentId, status: newStatus })
  }

  return (
    <EnrolledStudentCardList
      sessionEnrollments={sessionEnrollments}
      isLoading={isLoading}
      session={session}
      onStatusChange={handleStatusChange}
      isUpdating={updateStatusMutation.isPending}
    />
  )
} 