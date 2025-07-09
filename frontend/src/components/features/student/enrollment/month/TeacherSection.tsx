import * as React from 'react'
import { TeacherInfo } from './types'

interface TeacherSectionProps {
  teacherInfo: TeacherInfo
}

export function TeacherSection({ teacherInfo }: TeacherSectionProps) {
  return (
    <div className="flex gap-5 justify-between items-start mt-7 w-full text-neutral-800">
      <div className="flex flex-col w-[234px]">
        <div className="text-base font-semibold tracking-normal leading-snug">
          {teacherInfo.name}
        </div>
        <div className="mt-2 text-base tracking-normal leading-5">
          {teacherInfo.education.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      </div>
      <img
        loading="lazy"
        src={teacherInfo.imageUrl}
        alt={`${teacherInfo.name} profile`}
        className="object-contain shrink-0 w-20 rounded-lg aspect-square"
      />
    </div>
  )
}
