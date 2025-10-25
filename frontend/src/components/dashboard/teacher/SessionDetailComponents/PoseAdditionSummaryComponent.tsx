'use client'

import React from 'react'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface PoseAdditionSummaryComponentProps {
  session: ClassSessionWithCounts | null
  onNavigateToDetail: () => void
}

export function PoseAdditionSummaryComponent({ session, onNavigateToDetail }: PoseAdditionSummaryComponentProps) {
  return (
    <div 
      className="bg-white border border-[#AC9592] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#AC9592]">자세 추가</h3>
        <span className="text-[#AC9592]">▼</span>
      </div>
    </div>
  )
}
