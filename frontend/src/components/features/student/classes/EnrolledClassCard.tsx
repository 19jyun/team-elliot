import * as React from 'react'
import Image from 'next/image'
import { StudentClass } from '@/types/api/student'

export interface EnrolledClassCardProps extends StudentClass {
  onClick?: () => void
}

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

const levelBadgeText: Record<LevelType, string> = {
  BEGINNER: '비기너',
  INTERMEDIATE: '초급',
  ADVANCED: '고급',
}

export const EnrolledClassCard: React.FC<EnrolledClassCardProps> = (props) => {
  const {
    className,
    name,
    dayOfWeek,
    startTime,
    endTime,
    level = 'BEGINNER',
    teacher,
    teacherName,
    location,
    onClick,
  } = props

  // 강의명: className 또는 name
  const displayClassName = (className as string) || name || ''
  // 선생님 이름: teacher?.name 또는 teacherName
  const displayTeacherName = (teacher && teacher.name) || teacherName || ''
  // 강의 장소: location
  const displayLocation = location || ''
  // level 타입 보정
  const safeLevel: LevelType =
    level === 'INTERMEDIATE' || level === 'ADVANCED' ? level : 'BEGINNER'

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDayOfWeek = (day: string) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: '월',
      TUESDAY: '화',
      WEDNESDAY: '수',
      THURSDAY: '목',
      FRIDAY: '금',
      SATURDAY: '토',
      SUNDAY: '일',
    }
    return dayMap[day] || day
  }

  return (
    <div
      className="relative flex flex-col p-4 rounded-lg transition-colors duration-200 cursor-pointer hover:shadow-md border border-gray-200"
      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
      onClick={onClick}
    >
      {/* 헤더: 난이도 배지와 날짜/시간 정보 */}
      <div className="flex items-center gap-2 mb-3 w-full pr-8">
        {/* 난이도 배지 */}
        <span
          className="px-2 py-1 text-xs font-medium text-white"
          style={{
            borderRadius: '4px',
            background: 'var(--Primary-Dark, linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), #573B30)',
          }}
        >
          {levelBadgeText[safeLevel]}
        </span>
        {/* 날짜/시간 정보 */}
        <span
          style={{
            color: 'var(--Primary-Dark, #573B30)',
            textAlign: 'center',
            fontFamily: 'Pretendard Variable',
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: '140%',
            letterSpacing: '-0.16px',
          }}
        >
          {formatDayOfWeek(dayOfWeek)} {formatTime(startTime)} ~ {formatTime(endTime)}
        </span>
      </div>
      {/* 선생님 이름 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        textAlign: 'left',
        fontFamily: 'Pretendard Variable',
        fontSize: 15,
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: '150%',
        letterSpacing: '-0.15px',
      }}>
        {displayTeacherName} 선생님
      </div>
      {/* 강의 이름 */}
      <div style={{
        color: 'var(--Primary-Dark, #573B30)',
        fontFamily: 'Pretendard Variable',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '140%',
        letterSpacing: '-0.14px',
      }}>
        {displayClassName}
      </div>
      {/* 강의 장소 */}
      <div className="mb-1 text-sm text-stone-600">
        {displayLocation}
      </div>
      
      {/* next 아이콘 - 카드 우측 가운데에 절대 위치로 배치 */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <Image src="/icons/next.svg" alt="다음" width={24} height={24} />
      </div>
    </div>
  )
} 