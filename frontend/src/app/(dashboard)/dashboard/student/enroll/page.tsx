'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { EnrollmentMainStep } from '@/components/dashboard/student/EnrollmentMainStep'

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

  if (subPage) {
    return null 
  }

  return <EnrollmentMainStep />
}
