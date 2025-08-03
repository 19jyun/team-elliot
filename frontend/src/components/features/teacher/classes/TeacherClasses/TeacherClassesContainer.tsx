'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ClassList } from '@/components/common/ClassContainer/ClassList'
import { ClassSessionModal } from '@/components/common/ClassContainer/ClassSessionModal'
import { useTeacherData } from '@/hooks/redux/useTeacherData'

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

  // Redux store에서 Teacher 데이터 가져오기
  const { classes: myClasses, sessions: mySessions, isLoading, error } = useTeacherData()

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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-5 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-stone-700">담당 클래스</h1>
        <p className="mt-2 text-stone-500">현재 담당하고 있는 클래스와 세션을 확인하세요</p>
      </div>

      {/* 클래스 리스트 */}
      <div className="flex-1 px-5 py-4">
        <ClassList
          classes={myClasses || []}
          onClassClick={handleClassClick}
          showTeacher={false}
          role="teacher"
          emptyMessage="담당하고 있는 클래스가 없습니다."
        />
      </div>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={mySessions || []}
        onClose={closeSessionModal}
        role="teacher"
      />
    </div>
  )
} 