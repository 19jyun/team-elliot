'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail'

// 컴포넌트 import
import { AttendanceSummaryComponent } from './SessionDetailComponents/AttendanceSummaryComponent'
import { ContentSummaryComponent } from './SessionDetailComponents/ContentSummaryComponent'
import { PoseAdditionSummaryComponent } from './SessionDetailComponents/PoseAdditionSummaryComponent'

export function SessionDetailPage() {
  const { sessionDetail } = useApp()
  const { setCurrentStep } = sessionDetail
  const searchParams = useSearchParams()
  
  // URL 파라미터에서 sessionId 가져오기
  const sessionId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  
  // React Query로 세션 데이터 조회
  const { data: selectedSession, isLoading } = useSessionDetail(sessionId)

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 세션 데이터가 없으면 에러 표시
  if (!selectedSession) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-red-500">세션 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white p-4 space-y-4">
      <AttendanceSummaryComponent 
        session={selectedSession}
      />
      <ContentSummaryComponent 
        session={selectedSession}
        onNavigateToDetail={() => setCurrentStep('content')}
      />
      <PoseAdditionSummaryComponent 
        onNavigateToDetail={() => setCurrentStep('pose')}
      />
    </div>
  )
}
