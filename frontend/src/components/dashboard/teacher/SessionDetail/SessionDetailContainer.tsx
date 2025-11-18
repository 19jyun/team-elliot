'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail'

// 컴포넌트 import
import { SessionDetailPage } from './SessionDetailPage'
import { ContentDetailComponent } from './SessionDetailComponents/ContentDetailComponent'
import { PoseAdditionDetailComponent } from './SessionDetailComponents/PoseAdditionDetailComponent'

export function SessionDetailContainer() {
  const { sessionDetail } = useApp()
  const { currentStep } = sessionDetail
  const searchParams = useSearchParams()
  
  // URL 파라미터에서 sessionId 가져오기
  const sessionId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  
  // React Query로 세션 데이터 조회
  const { data: selectedSession, isLoading } = useSessionDetail(sessionId)

  // 날짜와 시간 포맷팅 함수
  const formatSessionInfo = () => {
    if (isLoading) return '로딩 중...'
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

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
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

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 세션 데이터가 없으면 에러 표시
  if (!selectedSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">세션 정보를 불러올 수 없습니다.</p>
      </div>
    )
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
