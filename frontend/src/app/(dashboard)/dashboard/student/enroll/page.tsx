'use client'

import * as React from 'react'
import { useSession } from '@/lib/auth/AuthProvider'
import { EnrollmentMainStep } from '@/components/dashboard/student/Enrollment/EnrollmentMainStep'

export default function EnrollPage() {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return <EnrollmentMainStep />
} 