'use client'

import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail'
import { PoseAdditionDetailComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/PoseAdditionDetailComponent'

function SessionDetailPoseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  
  const { data: selectedSession } = useSessionDetail(sessionId)

  const handleGoBack = () => {
    router.back()
  }

  return (
    <PoseAdditionDetailComponent 
      session={selectedSession}
      onBack={handleGoBack}
    />
  )
}

export default function SessionDetailPosePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    }>
      <SessionDetailPoseContent />
    </Suspense>
  )
}
