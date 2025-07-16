import { StudentClass } from '@/types/api/student'
import Image from 'next/image'
import { EnrolledClassCard } from './EnrolledClassCard'

export interface EnrolledClassesListProps {
  classes: StudentClass[]
  onClassClick?: (classData: StudentClass) => void
  emptyMessage?: string
}

export const EnrolledClassesList: React.FC<EnrolledClassesListProps> = ({
  classes,
  onClassClick,
  emptyMessage = '수강중인 클래스가 없습니다',
}) => {
  if (!classes || classes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center py-8 flex-1">
          <Image
            src="/images/logo/team-eliot-2.png"
            alt="수강중인 클래스 없음"
            width={120}
            height={120}
          />
          <p className="mt-4 text-stone-500">{emptyMessage}</p>
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
            <EnrolledClassCard
              key={classData.id}
              {...classData}
              onClick={() => onClassClick?.(classData)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 