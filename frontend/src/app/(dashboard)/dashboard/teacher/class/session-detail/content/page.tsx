'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts';
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail';
import { ContentDetailComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/ContentDetailComponent';

export default function SessionDetailContentPage() {
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
    <ContentDetailComponent 
      session={selectedSession}
      onBack={handleGoBack}
    />
  )
}
