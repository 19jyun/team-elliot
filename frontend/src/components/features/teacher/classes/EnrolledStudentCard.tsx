import React from 'react'

interface EnrolledStudent {
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

interface EnrolledStudentCardProps {
  enrollment: EnrolledStudent
}

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '수락 대기 중'
    case 'CONFIRMED':
      return '수락됨'
    case 'REJECTED':
      return '거절됨'
    case 'CANCELLED':
      return '학생 취소'
    case 'REFUND_REQUESTED':
      return '환불 대기 중'
    case 'REFUND_CANCELLED':
      return '환불 승인됨'
    case 'TEACHER_CANCELLED':
      return '선생님 취소'
    default:
      return status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-600'
    case 'CONFIRMED':
      return 'text-green-600'
    case 'REJECTED':
      return 'text-red-600'
    case 'CANCELLED':
      return 'text-gray-600'
    case 'REFUND_REQUESTED':
      return 'text-orange-600'
    case 'REFUND_CANCELLED':
      return 'text-blue-600'
    case 'TEACHER_CANCELLED':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

export const EnrolledStudentCard: React.FC<EnrolledStudentCardProps> = ({
  enrollment
}) => {
  // level 타입 보정
  const safeLevel: LevelType =
    enrollment.student?.level === 'INTERMEDIATE' || enrollment.student?.level === 'ADVANCED' 
      ? enrollment.student.level 
      : 'BEGINNER'

  return (
    <div
      className="relative flex flex-col p-4 mb-3 rounded-lg border border-gray-200"
      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
    >
      {/* 학생 정보 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        fontFamily: 'Pretendard Variable',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: '140%',
        letterSpacing: '-0.16px',
        marginBottom: '8px',
      }}>
        {enrollment.student.name}
      </div>
      
      {/* 학생 상세 정보 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        fontFamily: 'Pretendard Variable',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '140%',
        letterSpacing: '-0.14px',
      }}>
        {enrollment.student.phoneNumber}
        {enrollment.student.email && ` | ${enrollment.student.email}`}
        {enrollment.student.level && ` | 레벨: ${enrollment.student.level}`}
      </div>
      
      {/* 상태 정보 - 우측 세로 정렬 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="flex flex-col items-end gap-2">
          {/* 상태 텍스트 */}
          <div style={{
            color: 'var(--Primary-Dark, #573B30)',
            textAlign: 'center',
            fontFamily: 'Pretendard Variable',
            fontSize: 12,
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: '140%',
            letterSpacing: '-0.12px',
          }}>
            <span className={getStatusColor(enrollment.status)}>
              {getStatusText(enrollment.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 