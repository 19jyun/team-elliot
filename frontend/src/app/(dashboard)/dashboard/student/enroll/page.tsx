'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { EnrollmentMainStep } from '@/components/dashboard/student/Enrollment/EnrollmentMainStep'

export default function EnrollPage() {
  const router = useRouter()
  const { subPage } = useDashboardNavigation()
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // SubPage가 설정되어 있으면 EnrollmentContainer가 렌더링되고,
  // 그렇지 않으면 기본 수강신청 페이지를 렌더링
  if (subPage) {
    return null // DashboardPage에서 EnrollmentContainer가 렌더링됨
  }

  return <EnrollmentMainStep />
} 