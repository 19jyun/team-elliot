'use client'

import React, { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from '@/components/common/Session/SessionCardList'
import { useStudentCalendarSessions } from '@/hooks/queries/student/useStudentCalendarSessions'
import { useTeacherCalendarSessions } from '@/hooks/queries/teacher/useTeacherCalendarSessions'
import { usePrincipalCalendarSessions } from '@/hooks/queries/principal/usePrincipalCalendarSessions'
import type { ClassSession, ClassSessionWithCounts } from '@/types/api/class'
import type { ClassSessionForEnrollment } from '@/types/api/student'
import type { TeacherSession } from '@/types/api/teacher'
import type { PrincipalClassSession } from '@/types/api/principal'
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
  session: _session 
}: DateSessionModalProps) {
  
  // React Query 기반 데이터 관리 (모든 hook 호출, enabled로 제어)
  const { data: studentSessionsData } = useStudentCalendarSessions(undefined, role === 'student');
  const { data: teacherSessionsData } = useTeacherCalendarSessions(undefined, role === 'teacher');
  const { data: principalSessionsData } = usePrincipalCalendarSessions(undefined, role === 'principal');

  // Role에 따라 적절한 세션 데이터 선택
  const allSessions = useMemo(() => {
    if (role === 'student') {
      return (studentSessionsData as ClassSessionForEnrollment[]) || [];
    } else if (role === 'teacher') {
      return (teacherSessionsData as TeacherSession[]) || [];
    } else if (role === 'principal') {
      return (principalSessionsData as PrincipalClassSession[]) || [];
    }
    return [];
  }, [role, studentSessionsData, teacherSessionsData, principalSessionsData]);

  // 날짜별 세션 조회 헬퍼 함수
  const getSessionsByDate = useCallback((date: Date) => {
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  }, [allSessions]);

  // 선택된 날짜의 세션들을 가져오기
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