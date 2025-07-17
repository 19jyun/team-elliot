'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClassSession } from '@/types/api/class';

export type CalendarMode = 'enrollment' | 'modification' | 'student-view' | 'teacher-view';

export interface SessionDisplayInfo {
  isSelectable: boolean;
  isSelected: boolean;
  displayText: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface CalendarContextType {
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
        return 'isModifiable' in session && Boolean(session.isModifiable);
      case 'student-view':
      case 'teacher-view':
        return false;
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