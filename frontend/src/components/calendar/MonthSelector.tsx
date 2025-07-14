'use client'

import React from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'

interface MonthSelectorProps {
  isOpen: boolean
  selectedMonth: number
  onClose: () => void
  onMonthSelect: (month: number) => void
}

export function MonthSelector({ 
  isOpen, 
  selectedMonth, 
  onClose, 
  onMonthSelect 
}: MonthSelectorProps) {
  const handleMonthClick = (month: number) => {
    onMonthSelect(month)
    onClose()
  }

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="월 선택"
      contentClassName="pb-6"
    >
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleMonthClick(index)}
            className={`flex items-center justify-center p-4 rounded-lg text-lg font-medium transition-colors ${
              selectedMonth === index
                ? 'bg-stone-700 text-white'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {index + 1}월
          </button>
        ))}
      </div>
    </SlideUpModal>
  )
}
