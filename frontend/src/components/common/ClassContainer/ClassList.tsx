import React from 'react'

import { CommonClassData, ClassCard } from './ClassCard'

interface ClassListProps {
  classes: CommonClassData[]
  onClassClick: (classData: CommonClassData) => void
  showTeacher?: boolean
  role?: 'teacher' | 'principal' | 'student'
  emptyMessage?: string
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  onClassClick,
  showTeacher = false,
  role = 'teacher',
  emptyMessage = '등록된 클래스가 없습니다.',
}) => {
  if (!classes || classes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center py-8 flex-1">
          <p className="text-stone-500 text-center">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-col gap-3 pb-4">
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onClick={onClassClick}
              showTeacher={showTeacher}
              role={role}
            />
          ))}
        </div>
      </div>
    </div>
  )
}