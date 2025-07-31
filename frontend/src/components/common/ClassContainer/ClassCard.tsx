import React from 'react'
import { format } from 'date-fns'

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

const getDayOfWeekText = (dayOfWeek: string) => {
  const dayMap: { [key: string]: string } = {
    'MONDAY': '월',
    'TUESDAY': '화',
    'WEDNESDAY': '수',
    'THURSDAY': '목',
    'FRIDAY': '금',
    'SATURDAY': '토',
    'SUNDAY': '일',
  }
  return dayMap[dayOfWeek] || dayOfWeek
}

const formatTime = (timeString: string) => {
  try {
    // timeString이 이미 ISO 문자열인 경우
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return format(date, 'HH:mm')
    }
    // timeString이 HH:mm 형식인 경우
    const date = new Date(`1970-01-01T${timeString}`)
    return format(date, 'HH:mm')
  } catch {
    return timeString
  }
}

// 공통 클래스 데이터 인터페이스
export interface CommonClassData {
  id: number
  className: string
  level: string
  dayOfWeek: string
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  teacher?: {
    id: number
    name: string
  }
}

interface ClassCardProps {
  classData: CommonClassData
  onClick: (classData: CommonClassData) => void
  showTeacher?: boolean // 담당 선생님 표시 여부 (Principal에서 사용)
  role?: 'teacher' | 'principal' | 'student'
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classData,
  onClick,
  showTeacher = false,
  role = 'teacher',
}) => {
  // level 타입 보정
  const safeLevel: LevelType =
    classData.level === 'INTERMEDIATE' || classData.level === 'ADVANCED' 
      ? classData.level 
      : 'BEGINNER'

  return (
    <div
      className="relative flex flex-col p-4 mb-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-stone-50 transition-colors"
      onClick={() => onClick(classData)}
      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
    >
      {/* 클래스 정보 */}
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
        {classData.className}
      </div>
      
      {/* 담당 선생님 (showTeacher가 true일 때만 표시) */}
      {showTeacher && classData.teacher && (
        <div style={{
          color: 'var(--Primary-Dark, #573B30)',
          fontFamily: 'Pretendard Variable',
          fontSize: 14,
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '140%',
          letterSpacing: '-0.14px',
          marginBottom: '4px',
        }}>
          담당: {classData.teacher.name} 선생님
        </div>
      )}
      
      {/* 수업 시간 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        fontFamily: 'Pretendard Variable',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '140%',
        letterSpacing: '-0.14px',
        marginBottom: '4px',
      }}>
        {getDayOfWeekText(classData.dayOfWeek)} {formatTime(classData.startTime)} ~ {formatTime(classData.endTime)}
      </div>
      
      {/* 수업 진행 기간 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        fontFamily: 'Pretendard Variable',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '140%',
        letterSpacing: '-0.12px',
      }}>
        {new Date(classData.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })} ~ {new Date(classData.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
} 