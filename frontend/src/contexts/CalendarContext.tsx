'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClassSession } from '@/types/api/class';

export type CalendarMode = 'enrollment' | 'modification' | 'student-view' | 'teacher-view';

interface SessionDisplayInfo {
  isSelectable: boolean;
  isSelected: boolean;
  displayText: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

interface CalendarContextType {
  mode: CalendarMode;
  sessions: ClassSession[];
  selectedSessionIds: Set<number>;
  focusedMonth: { year: number; month: number };
  calendarRange?: { startDate: Date; endDate: Date };
  onSessionSelect: (sessionId: number) => void;
  onDateClick: (date: string) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  updateFocusedMonth: (year: number, month: number) => void;
  getSessionDisplayInfo: (session: ClassSession) => SessionDisplayInfo;
  canSelectSession: (session: ClassSession) => boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
  mode: CalendarMode;
  sessions: ClassSession[];
  selectedSessionIds: Set<number>;
  onSessionSelect: (sessionId: number) => void;
  onDateClick?: (date: string) => void;
  initialFocusedMonth?: { year: number; month: number };
  calendarRange?: { startDate: Date; endDate: Date };
}

export function CalendarProvider({
  children,
  mode,
  sessions,
  selectedSessionIds,
  onSessionSelect,
  onDateClick,
  initialFocusedMonth,
  calendarRange,
}: CalendarProviderProps) {
  const [focusedMonth, setFocusedMonth] = useState(() => {
    if (initialFocusedMonth) return initialFocusedMonth;
    
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setFocusedMonth(prev => {
      let newMonth = prev.month;
      let newYear = prev.year;

      if (direction === 'prev') {
        if (newMonth === 1) {
          newMonth = 12;
          newYear--;
        } else {
          newMonth--;
        }
      } else {
        if (newMonth === 12) {
          newMonth = 1;
          newYear++;
        } else {
          newMonth++;
        }
      }

      return { year: newYear, month: newMonth };
    });
  };

  const updateFocusedMonth = (year: number, month: number) => {
    // 캘린더 범위 제한이 있는 경우 체크
    if (calendarRange) {
      const targetDate = new Date(year, month - 1, 1);
      const startDate = new Date(calendarRange.startDate.getFullYear(), calendarRange.startDate.getMonth(), 1);
      const endDate = new Date(calendarRange.endDate.getFullYear(), calendarRange.endDate.getMonth() + 1, 0);
      
      if (targetDate < startDate || targetDate > endDate) {
        return; // 범위를 벗어나면 업데이트하지 않음
      }
    }
    
    setFocusedMonth({ year, month });
  };

  const canSelectSession = (session: ClassSession): boolean => {
    switch (mode) {
      case 'enrollment':
        return session.isEnrollable || false;
      case 'modification':
        // 기존 로직과 동일: isSelectable 또는 canBeCancelled인 경우 선택 가능
        return ('isSelectable' in session && Boolean(session.isSelectable)) ||
               ('canBeCancelled' in session && Boolean(session.canBeCancelled));
      case 'student-view':
      case 'teacher-view':
        // student-view와 teacher-view에서는 세션이 있으면 클릭 가능 (모달 표시용)
        return true;
      default:
        return false;
    }
  };

  const getSessionDisplayInfo = (session: ClassSession): SessionDisplayInfo => {
    const isSelectable = canSelectSession(session);
    const isSelected = selectedSessionIds.has(session.id);

    switch (mode) {
      case 'enrollment':
        if (!isSelectable) {
          return {
            isSelectable: false,
            isSelected: false,
            displayText: '신청 불가',
            backgroundColor: 'bg-gray-200',
            textColor: 'text-gray-500',
            borderColor: 'border-gray-300',
          };
        }
        
        if (isSelected) {
          return {
            isSelectable: true,
            isSelected: true,
            displayText: '선택됨',
            backgroundColor: 'bg-[#AC9592]',
            textColor: 'text-white',
            borderColor: 'border-[#AC9592]',
          };
        }
        
        return {
          isSelectable: true,
          isSelected: false,
          displayText: '신청 가능',
          backgroundColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };

      case 'modification':
        // modification 모드에서 선택 불가능한 경우
        if (!isSelectable) {
          let displayText = '수강 불가';
          if ('isPastStartTime' in session && session.isPastStartTime) {
            displayText = '이미 시작된 수업';
          } else if ('isFull' in session && session.isFull && !('isAlreadyEnrolled' in session && session.isAlreadyEnrolled)) {
            displayText = '수강 인원 초과';
          } else if ('isAlreadyEnrolled' in session && session.isAlreadyEnrolled && 'isPastStartTime' in session && session.isPastStartTime) {
            displayText = '이미 시작된 수업';
          }
          
          return {
            isSelectable: false,
            isSelected: false,
            displayText,
            backgroundColor: 'bg-gray-200',
            textColor: 'text-gray-500',
            borderColor: 'border-gray-300',
          };
        }
        
        // modification 모드에서 선택 가능한 경우
        if (isSelected) {
          return {
            isSelectable: true,
            isSelected: true,
            displayText: '선택됨',
            backgroundColor: 'bg-[#573B30]',
            textColor: 'text-white',
            borderColor: 'border-[#573B30]',
          };
        }
        
        // modification 모드에서 선택 가능하지만 선택되지 않은 경우
        let displayText = '수정 가능';
        if ('isSelectable' in session && session.isSelectable) {
          displayText = '수강 변경 가능';
        } else if ('canBeCancelled' in session && session.canBeCancelled) {
          displayText = '환불 신청 가능';
        }
        
        return {
          isSelectable: true,
          isSelected: false,
          displayText,
          backgroundColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };

      case 'student-view':
        // student-view 모드: 모든 세션이 클릭 가능 (모달 표시용)
        if (isSelected) {
          return {
            isSelectable: true,
            isSelected: true,
            displayText: '수강 중',
            backgroundColor: 'bg-[#573B30]',
            textColor: 'text-white',
            borderColor: 'border-[#573B30]',
          };
        }
        
        // student-view 모드: 일반 세션 표시 (클릭 가능)
        let sessionStatus = '수강 예정';
        if (session.isPastStartTime) {
          sessionStatus = '수강 완료';
        } else if (session.isFull) {
          sessionStatus = '수강 인원 초과';
        }
        
        return {
          isSelectable: true,
          isSelected: false,
          displayText: sessionStatus,
          backgroundColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };

      default:
        return {
          isSelectable: false,
          isSelected: false,
          displayText: '',
          backgroundColor: 'bg-gray-50',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-200',
        };
    }
  };

  const value: CalendarContextType = {
    mode,
    sessions,
    selectedSessionIds,
    focusedMonth,
    calendarRange,
    onSessionSelect,
    onDateClick: onDateClick || (() => {}),
    onMonthChange: handleMonthChange,
    updateFocusedMonth,
    getSessionDisplayInfo,
    canSelectSession,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
} 