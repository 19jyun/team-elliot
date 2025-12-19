'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts';
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail';
import { ensureTrailingSlash } from '@/lib/utils/router';

// 컴포넌트
import { AttendanceSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/AttendanceSummaryComponent';
import { ContentSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/ContentSummaryComponent';
import { PoseAdditionSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/PoseAdditionSummaryComponent';

export default function TeacherSessionDetailPage() {
  const router = useRouter()
  const { form } = useApp()
  const sessionId = form.sessionDetail.selectedSessionId

  useEffect(() => {
    if (!sessionId) {
      router.replace(ensureTrailingSlash('/dashboard/teacher/class'))
    }
  }, [sessionId, router])

  const { data: selectedSession, isLoading } = useSessionDetail(sessionId)

  if (!sessionId) return null

  const handleNavigateToContent = () => {
    router.push(ensureTrailingSlash(`/dashboard/teacher/class/session-detail/content`))
  }

  const handleNavigateToPose = () => {
    router.push(ensureTrailingSlash(`/dashboard/teacher/class/session-detail/pose`))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!selectedSession) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-red-500">세션 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white p-4 space-y-4">
      <AttendanceSummaryComponent session={selectedSession} />
      
      <ContentSummaryComponent 
        session={selectedSession}
        onNavigateToDetail={handleNavigateToContent}
      />
      
      <PoseAdditionSummaryComponent 
        onNavigateToDetail={handleNavigateToPose}
      />
    </div>
  )
}