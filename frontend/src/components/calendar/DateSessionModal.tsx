'use client'

import React from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from './SessionCardList'

interface DateSessionModalProps {
  isOpen: boolean
  selectedDate: Date | null
  sessions: any[]
  onClose: () => void
  onSessionClick: (session: any) => void
  userRole: 'student' | 'teacher'
}

export function DateSessionModal({ 
  isOpen, 
  selectedDate, 
  sessions, 
  onClose, 
  onSessionClick,
  userRole 
}: DateSessionModalProps) {
  const formatDate = (date: Date) => {
    return format(date, 'M월 d일 (E)', { locale: ko })
  }

  const getTitle = () => {
    if (!selectedDate) return '세션 목록'
    return formatDate(selectedDate)
  }

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      contentClassName="pb-6"
    >
      <SessionCardList
        sessions={sessions}
        onSessionClick={onSessionClick}
        userRole={userRole}
      />
    </SlideUpModal>
  )
} 