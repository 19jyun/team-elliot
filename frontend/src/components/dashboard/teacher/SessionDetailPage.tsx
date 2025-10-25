'use client'

import React, { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { CommonHeader } from '@/components/layout/CommonHeader'
import type { ClassSessionWithCounts } from '@/types/api/class'

// 컴포넌트 import
import { AttendanceSummaryComponent } from './SessionDetailComponents/AttendanceSummaryComponent'
import { AttendanceDetailComponent } from './SessionDetailComponents/AttendanceDetailComponent'
import { ContentSummaryComponent } from './SessionDetailComponents/ContentSummaryComponent'
import { ContentDetailComponent } from './SessionDetailComponents/ContentDetailComponent'
import { PoseAdditionSummaryComponent } from './SessionDetailComponents/PoseAdditionSummaryComponent'
import { PoseAdditionDetailComponent } from './SessionDetailComponents/PoseAdditionDetailComponent'

// 단계별 뷰 타입 정의
type CurrentView = 'main' | 'attendanceDetail' | 'contentSummaryDetail' | 'poseAdditionDetail'

export function SessionDetailPage() {
  const { data, goBack } = useApp()
  const [currentView, setCurrentView] = useState<CurrentView>('main')
  
  // DataContext에서 선택된 세션 정보 가져오기
  const selectedSession = data.getCache('selectedSession') as ClassSessionWithCounts | null

  // 뒤로가기 핸들러 (EnrollmentContainer와 동일한 패턴)
  const handleNavigateBack = async () => {
    if (currentView === 'main') {
      await goBack()
    } else {
      setCurrentView('main')
    }
  }

  // 현재 단계에 따라 적절한 컴포넌트 렌더링 (EnrollmentContainer와 동일한 패턴)
  const renderCurrentStep = () => {
    switch (currentView) {
      case 'main':
        return (
          <div className="flex flex-col h-full bg-white p-4 space-y-4">
            <AttendanceSummaryComponent 
              session={selectedSession}
              onNavigateToDetail={() => setCurrentView('attendanceDetail')}
            />
            <ContentSummaryComponent 
              session={selectedSession}
              onNavigateToDetail={() => setCurrentView('contentSummaryDetail')}
            />
            <PoseAdditionSummaryComponent 
              session={selectedSession}
              onNavigateToDetail={() => setCurrentView('poseAdditionDetail')}
            />
          </div>
        )
      case 'attendanceDetail':
        return (
          <AttendanceDetailComponent 
            session={selectedSession}
            onBack={() => setCurrentView('main')}
          />
        )
      case 'contentSummaryDetail':
        return (
          <ContentDetailComponent 
            session={selectedSession}
            onBack={() => setCurrentView('main')}
          />
        )
      case 'poseAdditionDetail':
        return (
          <PoseAdditionDetailComponent 
            session={selectedSession}
            onBack={() => setCurrentView('main')}
          />
        )
      default:
        return null
    }
  }

  // 날짜와 시간 포맷팅 함수
  const formatSessionInfo = () => {
    if (!selectedSession) return '세션 정보 없음'
    
    const sessionDate = new Date(selectedSession.date)
    const startTime = new Date(selectedSession.startTime)
    
    const year = sessionDate.getFullYear()
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0')
    const day = String(sessionDate.getDate()).padStart(2, '0')
    const hours = String(startTime.getHours()).padStart(2, '0')
    const minutes = String(startTime.getMinutes()).padStart(2, '0')
    
    const className = selectedSession.class?.className || '클래스명'
    
    return `${year}년 ${month}월 ${day}일 ${className}(${hours}시)`
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
