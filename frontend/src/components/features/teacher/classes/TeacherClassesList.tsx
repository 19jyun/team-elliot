import React from 'react'
import { format } from 'date-fns'

import { TeacherClassesResponse } from '@/types/api/teacher'

type ClassData = TeacherClassesResponse[0]

interface TeacherClassesListProps {
  classes: ClassData[]
  onClassClick: (classData: ClassData) => void
}

export const TeacherClassesList: React.FC<TeacherClassesListProps> = ({
  classes,
  onClassClick,
}) => {
  if (!classes || classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-stone-500 text-center">담당하고 있는 클래스가 없습니다.</p>
      </div>
    )
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
      return format(date, 'HH:mm')
    } catch {
      return timeString
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {classes.map((classData) => (
        <div
          key={classData.id}
          className="flex flex-col p-4 bg-white rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors"
          onClick={() => onClassClick(classData)}
          style={{
            borderLeft: classData.backgroundColor ? `4px solid ${classData.backgroundColor}` : '4px solid #573B30',
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-stone-700">
              {classData.className}
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-stone-100 text-stone-600 rounded">
              {getLevelText(classData.level)}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">수업 시간:</span>
              <span>
                {getDayOfWeekText(classData.dayOfWeek)} {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">수강생:</span>
              <span>
                {classData.currentStudents} / {classData.maxStudents}명
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">수강료:</span>
              <span>{classData.tuitionFee.toLocaleString()}원</span>
            </div>

            {classData.description && (
              <div className="flex items-start gap-2 mt-1">
                <span className="font-medium">설명:</span>
                <span className="text-stone-500 line-clamp-2">
                  {classData.description}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 