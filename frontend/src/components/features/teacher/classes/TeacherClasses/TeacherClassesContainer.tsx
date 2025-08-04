'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ClassList } from '@/components/common/ClassContainer/ClassList'
import { ClassSessionModal } from '@/components/common/ClassContainer/ClassSessionModal'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'

export function TeacherClassesContainer() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  // API 기반 데이터 관리
  const { classes: myClasses, sessions: mySessions, loadClasses, isLoading, error } = useTeacherApi()

  // 초기 데이터 로드
  useEffect(() => {
    loadClasses();
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
    if ((error as any)?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/auth' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => loadClasses()}
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

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        <div className="flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            내 담당 클래스
          </h1>
          <p className="mt-2 text-stone-500">
            담당하고 있는 클래스들을 확인하세요.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ClassList
          classes={myClasses}
          onClassClick={handleClassClick}
          role="teacher"
        />
      </main>

      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        onClose={closeSessionModal}
        role="teacher"
      />
    </div>
  )
} 