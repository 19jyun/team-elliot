'use client'

import React, { useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from '@/components/common/Session/SessionCardList'
import { useRoleCalendarApi } from '@/hooks/useRoleCalendarApi'

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
  
  // Role별 API 기반 데이터 관리
  const { getSessionsByDate, loadSessions } = useRoleCalendarApi(role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'PRINCIPAL');

  // 모달이 열릴 때 세션 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  // 선택된 날짜의 세션들을 API에서 가져오기
  const sessions = useMemo(() => {
    if (!selectedDate) return [];
    const result = getSessionsByDate(selectedDate);
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