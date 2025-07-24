'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { getMyClasses } from '@/api/student'
import { EnrolledClassesList } from '@/components/features/student/classes/EnrolledClassesList'
import { ClassSessionModal } from '@/components/features/student/classes/ClassSessionModal'

export function EnrolledClassesContainer() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  const { data: myClasses, isLoading, error } = useQuery({
    queryKey: ['my-classes'],
    queryFn: getMyClasses,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

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
            classes={myClasses?.enrollmentClasses || []}
            onClassClick={handleClassClick}
          />
        </div>
      </div>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={myClasses?.sessionClasses || []}
        onClose={closeSessionModal}
      />
    </div>
  )
} 