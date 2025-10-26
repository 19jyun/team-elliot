'use client'

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import type { ClassSessionWithCounts } from '@/types/api/class'

// 컴포넌트 import
import { SessionDetailPage } from './SessionDetailPage'
import { ContentDetailComponent } from './SessionDetailComponents/ContentDetailComponent'
import { PoseAdditionDetailComponent } from './SessionDetailComponents/PoseAdditionDetailComponent'

export function SessionDetailContainer() {
  const { sessionDetail, data } = useApp()
  const { currentStep } = sessionDetail
  
  // DataContext에서 선택된 세션 정보 가져오기
  const selectedSession = data.getCache('selectedSession') as ClassSessionWithCounts | null

  // 날짜와 시간 포맷팅 함수
  const formatSessionInfo = () => {
    if (!selectedSession) return '세션 정보 없음'
    
    const sessionDate = new Date(selectedSession.date)
    const startTime = new Date(selectedSession.startTime)
    
    const year = sessionDate.getFullYear()
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0')
    const day = String(sessionDate.getDate()).padStart(2, '0')
    const hours = String(startTime.getHours()).padStart(2, '0')
    
    const className = selectedSession.class?.className || '클래스명'
    
    return `${year}년 ${month}월 ${day}일 ${className}(${hours}시)`
  }

  // 현재 단계에 따라 적절한 컴포넌트 렌더링 (EnrollmentContainer와 동일한 패턴)
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'main':
        return <SessionDetailPage />
      case 'content':
        return (
          <ContentDetailComponent 
            session={selectedSession}
            onBack={() => sessionDetail.setCurrentStep('main')}
          />
        )
      case 'pose':
        return (
          <PoseAdditionDetailComponent 
            session={selectedSession}
            onBack={() => sessionDetail.setCurrentStep('main')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white text-black font-pretendard">
      {/* 세션 정보 헤더 */}
      <div className="bg-white px-4 py-5">
        <h1 className="text-lg font-semibold text-[#573B30] text-center">
          {formatSessionInfo()}
        </h1>
      </div>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {renderCurrentStep()}
      </main>
    </div>
  )
}
