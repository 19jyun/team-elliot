'use client'

import React from 'react'

interface ClassDetailProps {
  classId: number
  classData: any
  role: 'teacher' | 'principal'
}

export const ClassDetail: React.FC<ClassDetailProps> = ({
  classId,
  classData,
  role
}) => {
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

  const getLevelText = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    }
    return levelMap[level] || level
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(`1970-01-01T${timeString}`)
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* 클래스 기본 정보 */}
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-4">
            클래스 정보
          </h3>
          <div className="bg-stone-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-600">클래스명:</span>
              <span className="font-medium">{classData.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">레벨:</span>
              <span className="font-medium">{getLevelText(classData.level) || '미설정'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">최대 인원:</span>
              <span className="font-medium">{classData.maxStudents}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">현재 인원:</span>
              <span className="font-medium">{classData.currentStudents}명</span>
            </div>
            {classData.teacher && (
              <div className="flex justify-between">
                <span className="text-stone-600">담당 선생님:</span>
                <span className="font-medium">{classData.teacher.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 수업 일정 */}
        <div>
          <h3 className="text-lg font-semibold text-stone-700 mb-4">
            수업 일정
          </h3>
          <div className="bg-stone-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-600">요일:</span>
              <span className="font-medium">{getDayOfWeekText(classData.dayOfWeek)}요일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">시간:</span>
              <span className="font-medium">
                {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
              </span>
            </div>
            {classData.startDate && classData.endDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-stone-600">시작일:</span>
                  <span className="font-medium">
                    {new Date(classData.startDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">종료일:</span>
                  <span className="font-medium">
                    {new Date(classData.endDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 권한별 추가 정보 */}
        {role === 'teacher' && (
          <div>
            <h3 className="text-lg font-semibold text-stone-700 mb-4">
              관리 기능
            </h3>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm text-stone-600">
                선생님 전용 관리 기능이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 