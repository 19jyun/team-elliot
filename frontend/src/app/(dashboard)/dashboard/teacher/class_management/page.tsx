'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { getMyAcademy } from '@/api/teacher'
import { toast } from 'sonner'

// 수업 관리 카드 컴포넌트
const ClassManagementCard: React.FC<{
  title: string
  description?: string
  isNew?: boolean
  onClick: () => void
}> = ({ title, description, isNew, onClick }) => (
  <div
    className="flex gap-10 justify-between items-center py-4 pr-4 pl-5 w-full text-base tracking-normal rounded-lg bg-stone-200 text-stone-700 cursor-pointer hover:bg-stone-400 transition-colors duration-200"
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    <div className="flex flex-col gap-1.5 items-start self-stretch my-auto">
      <div className="flex gap-1.5 items-center">
        {isNew && (
          <div className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            NEW
          </div>
        )}
        <div className="text-base font-medium tracking-normal text-stone-700">
          {title}
        </div>
      </div>
      <div className="text-sm text-stone-600">
        {description}
      </div>
    </div>
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/1f7fc23429841d7be71eef4a524441a0723472cbcc37e1d51e9a8dccc0d60f49?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
      alt="Arrow indicator"
      className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
    />
  </div>
)

export default function TeacherClassManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })
  const { navigateToSubPage } = useDashboardNavigation()

  // 선생님의 학원 정보 조회
  const { data: myAcademy, isLoading: isAcademyLoading } = useQuery({
    queryKey: ['teacher-academy'],
    queryFn: getMyAcademy,
    enabled: status === 'authenticated',
  })

  const handleCreateClass = () => {
    // 학원 가입 여부 확인
    if (!myAcademy) {
      toast.error('학원을 먼저 가입해주세요!')
      return
    }
    
    navigateToSubPage('create-class')
  }

  const handleStudentFeedback = () => {
    // TODO: 수강생 피드백 기능 구현
    console.log('수강생 피드백 버튼 클릭됨')
  }

  const handleFutureFeature = () => {
    // TODO: 추후 기능 구현
    console.log('추후 기능 버튼 클릭됨')
  }

  if (status === 'loading' || isAcademyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">수업 관리</h1>
      </div>

      {/* 수업 관리 카드 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        <ClassManagementCard
          title="강의 개설"
          onClick={handleCreateClass}
        />
        
        <div className="mt-3">
          <ClassManagementCard
            title="수강생 피드백"
            onClick={handleStudentFeedback}
          />
        </div>

        <div className="mt-3">
          <ClassManagementCard
            title="추후 기능 추가 예정"
            description="더 많은 기능이 준비 중입니다"
            isNew
            onClick={handleFutureFeature}
          />
        </div>
      </div>
    </div>
  )
}
