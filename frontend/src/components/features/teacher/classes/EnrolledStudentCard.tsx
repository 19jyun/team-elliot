import React from 'react'

interface EnrolledStudent {
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

interface EnrolledStudentCardProps {
  enrollment: EnrolledStudent
  isSelected: boolean
  onSelect: (enrollmentId: number) => void
  onStatusChange: (enrollmentId: number, status: string) => void
  isUpdating: boolean
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
      return '수락 대기'
    case 'CONFIRMED':
      return '수락됨'
    case 'REJECTED':
      return '거절됨'
    case 'CANCELLED':
      return '취소됨'
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
    default:
      return 'text-gray-600'
  }
}

export const EnrolledStudentCard: React.FC<EnrolledStudentCardProps> = ({
  enrollment,
  isSelected,
  onSelect,
  onStatusChange,
  isUpdating
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
      {/* 체크박스 */}
      <div className="absolute left-4 top-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(enrollment.id)}
          className="rounded border-stone-300"
        />
      </div>

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
        marginLeft: '24px', // 체크박스 공간 확보
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
        marginLeft: '24px', // 체크박스 공간 확보
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

          {/* 액션 버튼들 */}
          {enrollment.status === 'PENDING' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onStatusChange(enrollment.id, 'CONFIRMED')}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                disabled={isUpdating}
              >
                수락
              </button>
              <button
                onClick={() => onStatusChange(enrollment.id, 'REJECTED')}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                disabled={isUpdating}
              >
                거절
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 