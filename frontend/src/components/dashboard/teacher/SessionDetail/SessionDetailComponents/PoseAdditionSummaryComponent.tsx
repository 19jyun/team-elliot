'use client'

import React from 'react'

interface PoseAdditionSummaryComponentProps {
  onNavigateToDetail: () => void
}

export function PoseAdditionSummaryComponent({ onNavigateToDetail }: PoseAdditionSummaryComponentProps) {
  return (
    <div 
      className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#573B30]">자세 추가</h3>
      </div>
      <div className="bg-gray-50 border border-[#BFBFBF] rounded-lg p-3 flex items-center justify-center h-20">
        <div className="text-[#AC9592] text-4xl font-light">+</div>
      </div>
    </div>
  )
}
