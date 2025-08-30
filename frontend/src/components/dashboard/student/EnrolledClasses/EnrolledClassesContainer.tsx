'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { EnrolledClassesList } from '@/components/features/student/classes/EnrolledClassesList'
import { ClassSessionModal } from '@/components/features/student/classes/ClassSessionModal'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import { useStudentApi } from '@/hooks/student/useStudentApi'

export function EnrolledClassesContainer() {
  const router = useRouter()
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  
  // StudentSessionDetailModal 상태 추가
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  // API 데이터 사용
  const { 
    sessionClasses, 
    isLoading, 
    error 
  } = useStudentApi()

  // sessionClasses에서 enrolledClasses 추출
  const enrolledClasses = React.useMemo(() => {
    if (!sessionClasses || sessionClasses.length === 0) return [];
    
    // 클래스별로 그룹화하여 중복 제거
    const classMap = new Map();
    sessionClasses.forEach((session: any) => {
      if (session.class) {
        const classId = session.class.id;
        if (!classMap.has(classId)) {
          classMap.set(classId, {
            ...session.class,
            sessions: sessionClasses.filter((s: any) => s.classId === classId)
          });
        }
      }
    });
    
    return Array.from(classMap.values());
  }, [sessionClasses]);

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
    if ((error as any)?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/auth' });
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

  const handleClassClick = (classData: any) => {
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setSelectedClass(null)
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: any) => {
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
            classes={enrolledClasses || []}
            onClassClick={handleClassClick}
          />
        </div>
      </div>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={sessionClasses || []}
        onClose={closeSessionModal}
        onSessionClick={handleSessionClick} // 세션 클릭 핸들러 전달
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