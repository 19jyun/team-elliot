'use client'

import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from '@/components/common/Session/SessionCardList'
import { usePrincipalData } from '@/hooks/redux/usePrincipalData'

interface DateSessionModalProps {
  isOpen: boolean
  selectedDate: Date | null
  onClose: () => void
  onSessionClick: (session: any) => void
  role: 'student' | 'teacher' | 'principal'
}

export function DateSessionModal({ 
  isOpen, 
  selectedDate, 
  onClose, 
  onSessionClick,
  role 
}: DateSessionModalProps) {
  // Redux store에서 데이터 가져오기
  const { getSessionsByDate } = usePrincipalData()

  // 선택된 날짜의 세션들을 Redux에서 가져오기
  const sessions = useMemo(() => {
    if (!selectedDate) return [];
    const result = getSessionsByDate(selectedDate);
    console.log('DateSessionModal - selectedDate:', selectedDate);
    console.log('DateSessionModal - sessions:', result);
    return result;
  }, [selectedDate, getSessionsByDate]);

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
        role={role}
      />
    </SlideUpModal>
  )
} 