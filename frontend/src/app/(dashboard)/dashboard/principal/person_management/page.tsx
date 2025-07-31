'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { getPrincipalAcademy } from '@/api/principal'
import { toast } from 'sonner'

// 인원 관리 카드 컴포넌트 (Teacher의 ClassManagementCard와 동일한 디자인)
const PersonManagementCard: React.FC<{
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

export default function PrincipalPersonManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })
  const { navigateToSubPage } = useDashboardNavigation()

  // Principal의 학원 정보 조회
  const { data: myAcademy, isLoading: isAcademyLoading } = useQuery({
    queryKey: ['principal-academy'],
    queryFn: getPrincipalAcademy,
    enabled: status === 'authenticated',
  })

  const handleEnrollmentRefundManagement = () => {
    // 학원 정보 확인
    if (!myAcademy) {
      toast.error('학원 정보를 불러올 수 없습니다!')
      return
    }
    
    navigateToSubPage('enrollment-refund-management')
  }

  const handleTeacherStudentManagement = () => {
    // 학원 정보 확인
    if (!myAcademy) {
      toast.error('학원 정보를 불러올 수 없습니다!')
      return
    }
    
    navigateToSubPage('teacher-student-management')
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
        <h1 className="text-2xl font-bold text-stone-700">인원 관리</h1>
        <p className="mt-2 text-stone-500">수강 신청/환불 신청과 수강생/강사를 관리하세요</p>
      </div>

      {/* 인원 관리 카드 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        <PersonManagementCard
          title="수강 신청/환불 신청 관리"
          onClick={handleEnrollmentRefundManagement}
        />
        
        <div className="mt-3">
          <PersonManagementCard
            title="수강생/강사 관리"
            onClick={handleTeacherStudentManagement}
          />
        </div>
      </div>
    </div>
  )
} 