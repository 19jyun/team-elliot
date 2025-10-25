'use client'

import React from 'react'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface PoseAdditionSummaryComponentProps {
  session: ClassSessionWithCounts | null
  onNavigateToDetail: () => void
}

export function PoseAdditionSummaryComponent({ session, onNavigateToDetail }: PoseAdditionSummaryComponentProps) {
  const hasSummary = session?.sessionSummary && session.sessionSummary.trim().length > 0
  
  return (
    <div 
      className="bg-white border border-[#AC9592] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#AC9592]">자세 추가</h3>
        <span className="text-[#AC9592]">▼</span>
      </div>
      {hasSummary && (
        <div className="bg-gray-50 border border-[#AC9592] rounded-lg p-3">
          <p className="text-[#573B30] text-sm">수업내용 요약</p>
          <p className="text-gray-800 text-sm mt-1">{session.sessionSummary}</p>
        </div>
      )}
    </div>
  )
}
