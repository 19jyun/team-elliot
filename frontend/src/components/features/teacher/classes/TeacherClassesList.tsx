import React from 'react'

import { TeacherClassesResponse } from '@/types/api/teacher'
import { TeacherClassCard } from './TeacherClassCard'

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

  return (
    <div className="flex flex-col gap-3 w-full">
      {classes.map((classData) => (
        <TeacherClassCard
          key={classData.id}
          classData={classData}
          onClick={onClassClick}
        />
      ))}
    </div>
  )
} 