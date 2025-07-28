'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { getPrincipalAllClasses } from '@/api/principal'
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

  // 세션 상세 모달 상태
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  // Principal의 모든 클래스 조회
  const { data: allClasses, isLoading, error } = useQuery({
    queryKey: ['principal-all-classes'],
    queryFn: getPrincipalAllClasses,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

  const classes = allClasses || []

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

  // 클래스 클릭 핸들러
  const handleClassClick = (classData: any) => {
    // 클래스의 첫 번째 세션을 선택 (임시로)
    if (classData.classSessions && classData.classSessions.length > 0) {
      setSelectedSession(classData.classSessions[0])
      setIsSessionDetailModalOpen(true)
    }
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
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
          classes={classes}
          onClassClick={handleClassClick}
          showTeacher={true}
          role="principal"
          emptyMessage="학원에 등록된 클래스가 없습니다."
        />
      </div>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionDetailModalOpen}
        selectedClass={selectedSession?.class}
        sessions={selectedSession ? [selectedSession] : []}
        onClose={closeSessionDetailModal}
        role="principal"
      />
    </div>
  )
} 