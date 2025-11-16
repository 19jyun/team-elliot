'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth/AuthProvider'

import { usePrincipalClasses } from '@/hooks/queries/principal/usePrincipalClasses'
import { usePrincipalCalendarSessions } from '@/hooks/queries/principal/usePrincipalCalendarSessions'
import { ClassList } from '@/components/common/ClassContainer/ClassList'
import { ClassSessionModal } from '@/components/common/ClassContainer/ClassSessionModal'
import { Class } from '@/types/api/class'
import { CommonClassData } from '@/components/common/ClassContainer/ClassCard'
import { DayOfWeek } from '@/types/api/common'
import { toClassSessionForCalendar } from '@/lib/adapters/principal'

export const PrincipalClassesContainer = () => {
  const { status } = useSession()

  // 클래스 선택 상태
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isClassSessionModalOpen, setIsClassSessionModalOpen] = useState(false)

  // React Query 기반 데이터 관리
  const { data: classes = [], isLoading: classesLoading, error: classesError } = usePrincipalClasses()
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = usePrincipalCalendarSessions()
  
  const isLoading = classesLoading || sessionsLoading
  const error = classesError || sessionsError

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 클래스 클릭 핸들러
  const handleClassClick = (classData: CommonClassData) => {
    // CommonClassData를 Class 타입으로 변환
    const classObj: Class = {
      id: classData.id,
      className: classData.className,
      classCode: '', // CommonClassData에는 없으므로 기본값
      description: '', // CommonClassData에는 없으므로 기본값
      maxStudents: 0, // CommonClassData에는 없으므로 기본값
      currentStudents: 0, // CommonClassData에는 없으므로 기본값
      tuitionFee: 0, // CommonClassData에는 없으므로 기본값
      teacherId: classData.teacher?.id || 0,
      academyId: 0, // CommonClassData에는 없으므로 기본값
      dayOfWeek: classData.dayOfWeek as DayOfWeek,
      startTime: classData.startTime,
      endTime: classData.endTime,
      level: classData.level,
      status: 'ACTIVE', // 기본값
      startDate: classData.startDate,
      endDate: classData.endDate,
      backgroundColor: '#f3f4f6', // 기본값
      teacher: classData.teacher ? { ...classData.teacher, photoUrl: '' } : { id: 0, name: '', photoUrl: '' },
      academy: { id: 0, name: '' }, // 기본값
    }
    setSelectedClass(classObj)
    setIsClassSessionModalOpen(true)
  }

  const closeClassSessionModal = () => {
    setIsClassSessionModalOpen(false)
    setSelectedClass(null)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-5 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-stone-700">전체 클래스</h1>
        <p className="mt-2 text-stone-500">학원의 모든 클래스를 확인할 수 있습니다.</p>
      </div>

      {/* 클래스 리스트 */}
      <div className="flex-1 px-5 py-4">
        <ClassList
          classes={classes || []}
          onClassClick={handleClassClick}
          showTeacher={true}
          role="principal"
          emptyMessage="학원에 등록된 클래스가 없습니다."
        />
      </div>

      {/* Class Session Modal */}
      {selectedClass && (
        <ClassSessionModal
          isOpen={isClassSessionModalOpen}
          selectedClass={selectedClass}
          sessions={Array.isArray(sessions) ? sessions.map(toClassSessionForCalendar) : []}
          onClose={closeClassSessionModal}
          role="principal"
        />
      )}
    </div>
  )
}