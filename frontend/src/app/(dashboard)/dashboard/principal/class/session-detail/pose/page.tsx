'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts';
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail';
import { PoseAdditionDetailComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/PoseAdditionDetailComponent';

export default function SessionDetailPosePage() {
  const router = useRouter()
  const { form } = useApp()
  const sessionId = form.sessionDetail.selectedSessionId
  
  useEffect(() => {
    if (!sessionId) {
      router.back()
    }
  }, [sessionId, router])

  const { data: selectedSession } = useSessionDetail(sessionId)

  const handleGoBack = () => {
    router.back()
  }

  if (!sessionId) return null

  return (
    <PoseAdditionDetailComponent 
      session={selectedSession}
      onBack={handleGoBack}
    />
  )
}
