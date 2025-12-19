'use client'

import React from 'react'
import { useApp } from '@/contexts'
import { useSessionDetail } from '@/hooks/queries/common/useSessionDetail'

interface LayoutProps {
  children: React.ReactNode
}

export default function SessionDetailLayout({ children }: LayoutProps) {
  const { form } = useApp()
  const sessionId = form.sessionDetail.selectedSessionId

  const { data: selectedSession, isLoading } = useSessionDetail(sessionId)

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 세션이 없으면 에러 표시
  if (!selectedSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">세션 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  // 날짜와 시간 포맷팅
  const formatSessionInfo = () => {
    const sessionDate = new Date(selectedSession.date)
    const startTime = new Date(selectedSession.startTime)
    
    const year = sessionDate.getFullYear()
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0')
    const day = String(sessionDate.getDate()).padStart(2, '0')
    const hours = String(startTime.getHours()).padStart(2, '0')
    
    const className = selectedSession.class?.className || '클래스명'
    
    return `${year}년 ${month}월 ${day}일 ${className}(${hours}시)`
  }

  return (
    <div className="flex flex-col h-full bg-white text-black font-pretendard">
      {/* 공통 헤더 */}
      <div className="bg-white px-4 py-5">
        <h1 className="text-lg font-semibold text-[#573B30] text-center">
          {formatSessionInfo()}
        </h1>
      </div>
      
      {/* 페이지별 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
