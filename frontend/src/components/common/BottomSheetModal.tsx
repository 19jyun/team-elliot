'use client'

import React, { ReactNode } from 'react'

interface BottomSheetModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxHeight?: string
}

export function BottomSheetModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxHeight = "max-h-96" 
}: BottomSheetModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-stone-700">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className={`overflow-y-auto px-6 py-4 ${maxHeight}`}>
          {children}
        </div>
      </div>
    </>
  )
} 