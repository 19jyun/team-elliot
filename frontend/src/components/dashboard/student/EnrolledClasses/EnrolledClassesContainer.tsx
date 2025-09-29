'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState } from 'react'
import React from 'react'

import { EnrolledClassesList } from '@/components/features/student/classes/EnrolledClassesList'
import { ClassSessionModal } from '@/components/features/student/classes/ClassSessionModal'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import { useStudentApi } from '@/hooks/student/useStudentApi'
import type { EnrolledClassVM, ClassDataVM, StudentEnrolledSessionVM } from '@/types/view/student'
import type { ApiError } from '@/types/ui/common'
import { toEnrolledClassVMs, toClassDataVM } from '@/lib/adapters/student'

export function EnrolledClassesContainer() {
  const { status } = useSession()
  const signOut = useSignOut()

  const [selectedClass, setSelectedClass] = useState<EnrolledClassVM | null>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  
  // StudentSessionDetailModal 상태 추가
  const [selectedSession, setSelectedSession] = useState<StudentEnrolledSessionVM | null>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  // API 데이터 사용
  const { 
    sessionClasses, 
    isLoading, 
    error 
  } = useStudentApi()

  // sessionClasses에서 enrolledClasses 추출 (어댑터 사용)
  const enrolledClasses: EnrolledClassVM[] = React.useMemo(() => {
    if (!sessionClasses || sessionClasses.length === 0) return [];
    return toEnrolledClassVMs(sessionClasses);
  }, [sessionClasses]);

  // ClassSessionModal에 전달할 ClassDataVM으로 변환 (어댑터 사용)
  const selectedClassData: ClassDataVM | null = selectedClass ? toClassDataVM({
    id: selectedClass.id,
    name: selectedClass.name,
    teacherName: selectedClass.teacherName,
    dayOfWeek: 'MONDAY', // 기본값 (EnrolledClassVM에서 string으로 되어있음)
    startTime: selectedClass.startTime,
    endTime: selectedClass.endTime,
  }) : null;

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
    const apiError = error as ApiError;
    if (apiError?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/' });
      return null;
    }
    
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

  const handleClassClick = (classData: EnrolledClassVM) => {
    // StudentClass를 EnrolledClassVM으로 변환
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setSelectedClass(null)
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: StudentEnrolledSessionVM) => {
    setSelectedSession(session)
    setIsSessionDetailModalOpen(true)
    // ClassSessionModal은 닫지 않고 유지 (사용자가 뒤로가기 할 수 있도록)
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          수강중인 클래스
        </h1>
        <p className="mt-2 text-stone-500">
          현재 수강중인 클래스와 세션을 확인하세요
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 bg-white px-5">
        {/* 수강중인 클래스 리스트 */}
        <div className="w-full h-full">
          <EnrolledClassesList
            classes={enrolledClasses}
            onClassClick={handleClassClick}
          />
        </div>
      </div>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClassData}
        sessions={selectedClass?.sessions || []}
        onClose={closeSessionModal}
        onSessionClick={handleSessionClick}
      />

      {/* Student Session Detail Modal */}
      <StudentSessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetailModal}
        onlyDetail={true}
      />
    </div>
  )
} 