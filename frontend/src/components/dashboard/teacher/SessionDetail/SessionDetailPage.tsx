'use client'

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import type { ClassSessionWithCounts } from '@/types/api/class'

// 컴포넌트 import
import { AttendanceSummaryComponent } from './SessionDetailComponents/AttendanceSummaryComponent'
import { ContentSummaryComponent } from './SessionDetailComponents/ContentSummaryComponent'
import { PoseAdditionSummaryComponent } from './SessionDetailComponents/PoseAdditionSummaryComponent'

export function SessionDetailPage() {
  const { sessionDetail, data } = useApp()
  const { setCurrentStep } = sessionDetail
  
  // DataContext에서 선택된 세션 정보 가져오기
  const selectedSession = data.getCache('selectedSession') as ClassSessionWithCounts | null

  return (
    <div className="flex flex-col h-full bg-white p-4 space-y-4">
      <AttendanceSummaryComponent 
        session={selectedSession}
        onNavigateToDetail={() => setCurrentStep('attendance')}
      />
      <ContentSummaryComponent 
        session={selectedSession}
        onNavigateToDetail={() => setCurrentStep('content')}
      />
      <PoseAdditionSummaryComponent 
        session={selectedSession}
        onNavigateToDetail={() => setCurrentStep('pose')}
      />
    </div>
  )
}
