'use client'

import React from 'react'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface ContentSummaryComponentProps {
  session: ClassSessionWithCounts | null
  onNavigateToDetail: () => void
}

export function ContentSummaryComponent({ session, onNavigateToDetail }: ContentSummaryComponentProps) {
  return (
    <div 
      className="bg-white border border-[#AC9592] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#AC9592]">오늘 수업내용</h3>
        <span className="text-[#AC9592]">▼</span>
      </div>
      <div className="bg-gray-50 border border-[#AC9592] rounded-lg p-3">
        <p className="text-[#573B30] text-sm">세줄요약</p>
        <p className="text-gray-800 text-sm mt-1">오늘은 샤세를 해용</p>
      </div>
    </div>
  )
}
