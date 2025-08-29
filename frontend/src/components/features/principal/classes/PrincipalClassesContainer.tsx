'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi'
import { useApiError } from '@/hooks/useApiError'
import { ClassList } from '@/components/common/ClassContainer/ClassList'
import { CommonClassData } from '@/components/common/ClassContainer/ClassCard'
import { ClassSessionModal } from '@/components/common/ClassContainer/ClassSessionModal'

export const PrincipalClassesContainer = () => {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  // 클래스 선택 상태
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isClassSessionModalOpen, setIsClassSessionModalOpen] = useState(false)

  // API 기반 데이터 관리
  const { classes, sessions, loadClasses, loadSessions, isLoading, error, isPrincipal } = usePrincipalApi()
  const { handleApiError } = useApiError()

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isPrincipal) {
      loadClasses();
      loadSessions();
    }
  }, []);

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
    // 에러가 발생하면 useApiError로 처리
    handleApiError(error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => {
            loadClasses();
            loadSessions();
          }}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // 클래스 클릭 핸들러
  const handleClassClick = (classData: any) => {
    setSelectedClass(classData)
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
      <ClassSessionModal
        isOpen={isClassSessionModalOpen}
        selectedClass={selectedClass}
        sessions={sessions || []}
        onClose={closeClassSessionModal}
        role="principal"
      />
    </div>
  )
}