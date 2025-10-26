'use client'

import React from 'react'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface ContentSummaryComponentProps {
  session: ClassSessionWithCounts | null
  onNavigateToDetail: () => void
}

export function ContentSummaryComponent({ session, onNavigateToDetail }: ContentSummaryComponentProps) {
  const hasContent = session?.sessionSummary && session.sessionSummary.trim().length > 0
  
  return (
    <div 
      className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#573B30]">오늘 수업내용</h3>
      </div>
      <p className="text-[#573B30] text-sm py-2">세줄요약</p>
      <div className="bg-gray-50 border border-[#BFBFBF] rounded-lg p-3">
        <p className="text-gray-800 text-sm mt-1">
          {hasContent ? session.sessionSummary : '수업내용을 입력해주세요'}
        </p>
      </div>
    </div>
  )
}
