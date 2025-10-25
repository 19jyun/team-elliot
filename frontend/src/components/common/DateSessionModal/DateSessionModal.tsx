'use client'

import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from '@/components/common/Session/SessionCardList'
import { useRoleCalendarApi } from '@/hooks/calendar/useRoleCalendarApi'
import type { ClassSession, ClassSessionWithCounts } from '@/types/api/class'
import { Session } from '@/lib/auth/AuthProvider'

interface DateSessionModalProps {
  isOpen: boolean
  selectedDate: Date | null
  onClose: () => void
  onSessionClick: (session: ClassSession) => void
  role: 'student' | 'teacher' | 'principal'
  session: Session | null
}

// 타입 가드 함수들
const hasEnrollmentCount = (session: unknown): session is { enrollmentCount: number } => {
  return typeof session === 'object' && session !== null && 'enrollmentCount' in session;
};

const hasConfirmedCount = (session: unknown): session is { confirmedCount: number } => {
  return typeof session === 'object' && session !== null && 'confirmedCount' in session;
};

export function DateSessionModal({ 
  isOpen, 
  selectedDate, 
  onClose, 
  onSessionClick,
  role,
  session 
}: DateSessionModalProps) {
  
  // Role별 API 기반 데이터 관리
  const { getSessionsByDate } = useRoleCalendarApi(role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'PRINCIPAL', session);

  // 선택된 날짜의 세션들을 API에서 가져오기
  const sessions = useMemo(() => {
    if (!selectedDate) return [];
    const result = getSessionsByDate(selectedDate);
    // ClassSessionWithCounts로 변환 (enrollmentCount, confirmedCount 기본값 설정)
    return result.map((session) => ({
      ...session,
      enrollmentCount: hasEnrollmentCount(session) ? session.enrollmentCount : 0,
      confirmedCount: hasConfirmedCount(session) ? session.confirmedCount : 0,
    })) as ClassSessionWithCounts[];
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