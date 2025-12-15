'use client'

import React, { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail'

// 컴포넌트
import { AttendanceSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/AttendanceSummaryComponent'
import { ContentSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/ContentSummaryComponent'
import { PoseAdditionSummaryComponent } from '@/components/dashboard/teacher/SessionDetail/SessionDetailComponents/PoseAdditionSummaryComponent'
import { ensureTrailingSlash } from '@/lib/utils/router'

function SessionDetailMainContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('id') ? Number(searchParams.get('id')) : null

  // ID가 없으면 리다이렉트
  useEffect(() => {
    if (!sessionId) {
      router.replace(ensureTrailingSlash('/dashboard/principal/class'))
    }
  }, [sessionId, router])

  const { data: selectedSession, isLoading } = useSessionDetail(sessionId)

  const handleNavigateToContent = () => {
    router.push(ensureTrailingSlash(`/dashboard/principal/class/session-detail/content?id=${sessionId}`))
  }

  const handleNavigateToPose = () => {
    router.push(ensureTrailingSlash(`/dashboard/principal/class/session-detail/pose?id=${sessionId}`))
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

export default function PrincipalSessionDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    }>
      <SessionDetailMainContent />
    </Suspense>
  )
}

