'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ClassSession, ClassSessionForModification } from '@/types/api/class';

interface CalendarRange {
  startDate: string;
  endDate: string;
}

interface MultiMonthCalendarProps {
  mode: 'enrollment' | 'modification';
  sessions: (ClassSession | ClassSessionForModification)[];
  calendarRange: CalendarRange | null;
  onSelectCountChange: (count: number) => void;
  onSelectableCountChange: (count: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected: boolean;
  onSelectedSessionsChange: (sessions: (ClassSession | ClassSessionForModification)[]) => void;
}

export function MultiMonthCalendar({
  mode,
  sessions,
  calendarRange,
  onSelectCountChange,
  onSelectableCountChange,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  onSelectedSessionsChange,
}: MultiMonthCalendarProps) {
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // 캘린더 범위에서 월 목록 생성
  const months = useMemo(() => {
    if (!calendarRange) return [];

    const startDate = new Date(calendarRange.startDate);
    const endDate = new Date(calendarRange.endDate);
    const months: { year: number; month: number }[] = [];

    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (currentDate <= endDate) {
      months.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }, [calendarRange]);

  // 선택 가능한 세션 필터링
  const selectableSessions = useMemo(() => {
    if (mode === 'enrollment') {
      return sessions.filter(session => session.isEnrollable);
    } else {
      return sessions.filter(session => 'isModifiable' in session && session.isModifiable);
    }
  }, [sessions, mode]);

  // 선택된 세션 개수 업데이트
  useEffect(() => {
    onSelectCountChange(selectedSessions.size);
  }, [selectedSessions, onSelectCountChange]);

  // 선택 가능한 세션 개수 업데이트
  useEffect(() => {
    onSelectableCountChange(selectableSessions.length);
  }, [selectableSessions, onSelectableCountChange]);

  // 전체 선택/해제 처리
  useEffect(() => {
    if (isAllSelected) {
      const selectableSessionIds = new Set(selectableSessions.map(s => s.id));
      setSelectedSessions(selectableSessionIds);
    } else {
      setSelectedSessions(new Set());
    }
  }, [isAllSelected, selectableSessions]);

  // 선택된 세션 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const selectedSessionsList = sessions.filter(s => selectedSessions.has(s.id));
    onSelectedSessionsChange(selectedSessionsList);
  }, [selectedSessions, sessions, onSelectedSessionsChange]);

  // 세션 선택/해제 핸들러
  const handleSessionToggle = (sessionId: number) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // 월별 세션 그룹핑
  const sessionsByMonth = useMemo(() => {
    const grouped: Record<string, ClassSession[]> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(session);
    });

    return grouped;
  }, [sessions]);

  // 월 네비게이션 핸들러
  const handlePrevMonth = () => {
    setCurrentMonthIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prev => Math.min(months.length - 1, prev + 1));
  };

  if (!calendarRange || months.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>캘린더 범위 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={handlePrevMonth}
          disabled={currentMonthIndex === 0}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-lg font-semibold text-gray-900">
          {months[currentMonthIndex]?.year}년 {months[currentMonthIndex]?.month}월
        </div>
        
        <button
          onClick={handleNextMonth}
          disabled={currentMonthIndex === months.length - 1}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 전체 선택/해제 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedSessions.size}개 선택됨
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전체 선택
          </button>
          <button
            onClick={onDeselectAll}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 월별 캘린더 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {months.map((monthInfo, index) => {
          const monthKey = `${monthInfo.year}-${monthInfo.month}`;
          const monthSessions = sessionsByMonth[monthKey] || [];
          
          return (
            <div key={monthKey} className="border-b border-gray-200">
              <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                {monthInfo.year}년 {monthInfo.month}월
              </div>
              
              <div className="p-4">
                {monthSessions.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    이번 달에는 세션이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                                         {monthSessions.map(session => {
                       const isSelected = selectedSessions.has(session.id);
                       const isSelectable = mode === 'enrollment' ? session.isEnrollable : ('isModifiable' in session && session.isModifiable);
                      
                      return (
                        <div
                          key={session.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isSelectable
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                          onClick={() => isSelectable && handleSessionToggle(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {new Date(session.date).toLocaleDateString('ko-KR', {
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short',
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {session.class?.className} - {session.startTime}~{session.endTime}
                              </div>
                              {session.class?.teacher && (
                                <div className="text-xs text-gray-500">
                                  {session.class.teacher.name} 선생님
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!isSelectable && (
                                <span className="text-xs text-red-500">
                                  {mode === 'enrollment' 
                                    ? (session.isFull ? '정원 마감' : session.isPastStartTime ? '시간 지남' : '이미 신청됨')
                                    : '변경 불가'
                                  }
                                </span>
                              )}
                              
                              {isSelected && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 