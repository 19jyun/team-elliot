import React from 'react'
import { EnrolledStudentCard } from './EnrolledStudents/EnrolledStudentCard'

interface SessionEnrollment {
  id: number
  sessionId: number
  studentId: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUND_CANCELLED' | 'TEACHER_CANCELLED'
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
}

export const EnrolledStudentCardList: React.FC<EnrolledStudentCardListProps> = ({
  sessionEnrollments,
  isLoading,
  session
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

  // CANCELLED, REJECTED, REFUND_CANCELLED, TEACHER_CANCELLED 상태 제외하고 필터링
  const activeEnrollments = sessionEnrollments.filter(e => 
    e.status !== 'CANCELLED' && 
    e.status !== 'REJECTED' && 
    e.status !== 'REFUND_CANCELLED' &&
    e.status !== 'TEACHER_CANCELLED'
  )
  
  if (activeEnrollments.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p>수강생이 없습니다.</p>
      </div>
    )
  }

  const pendingEnrollments = activeEnrollments.filter(e => e.status === 'PENDING')
  const confirmedEnrollments = activeEnrollments.filter(e => e.status === 'CONFIRMED')
  const otherEnrollments = activeEnrollments.filter(e => e.status !== 'PENDING' && e.status !== 'CONFIRMED')

  return (
    <div className="space-y-4 py-3">
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 