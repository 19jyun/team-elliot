'use client'

import * as React from 'react'
import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDate, isSameMonth, format, addMonths, subMonths } from 'date-fns'
import { getClassSessions } from '@/api/class-sessions'
import { getClassDetails } from '@/app/api/classes'
import { ClassSession, ClassSessionForModification } from '@/types/api/class'

interface MultiMonthCalendarProps {
  // 기본 설정
  mode: 'classes' | 'enrollment' | 'modification';
  
  // 날짜 범위
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  
  // 데이터
  sessions?: ClassSession[];
  modificationSessions?: ClassSessionForModification[];
  
  // 이벤트 핸들러
  onDateClick?: (date: Date, sessions: ClassSession[]) => void;
  onSessionSelect?: (session: ClassSession, selected: boolean) => void;
  onCurrentMonthChange?: (month: number, year: number) => void;
  
  // UI 설정
  showMonthNavigation?: boolean;
  showYearNavigation?: boolean;
  highlightCurrentMonth?: boolean;
  
  // 선택 관련 (enrollment, modification 모드용)
  selectedSessions?: Set<string>;
  onSelectCountChange?: (count: number) => void;
  onSelectableCountChange?: (count: number) => void;
}

// 월별 캘린더 컴포넌트
function MonthCalendar({ 
  month, 
  year, 
  sessions, 
  mode, 
  onDateClick, 
  onSessionSelect,
  selectedSessions,
  isCurrentMonth
}: {
  month: number;
  year: number;
  sessions: ClassSession[];
  mode: 'classes' | 'enrollment' | 'modification';
  onDateClick?: (date: Date, sessions: ClassSession[]) => void;
  onSessionSelect?: (session: ClassSession, selected: boolean) => void;
  selectedSessions?: Set<string>;
  isCurrentMonth?: boolean;
}) {
  // 해당 월의 달력 배열 생성
  const days = useMemo(() => {
    const firstDayOfMonth = startOfMonth(new Date(year, month - 1))
    const lastDayOfMonth = endOfMonth(firstDayOfMonth)
    const firstDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 })
    const lastDay = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 })

    const days = []
    let day = firstDay
    while (day <= lastDay) {
      days.push({
        date: day,
        day: getDate(day),
        isCurrentMonth: isSameMonth(day, firstDayOfMonth),
      })
      day = addDays(day, 1)
    }
    return days
  }, [year, month])

  // 해당 날짜의 세션들 가져오기
  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return sessions.filter(session => {
      const sessionDate = new Date(session.date)
      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd')
      return sessionDateStr === dateStr
    })
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const daySessions = getSessionsForDate(date)
    onDateClick?.(date, daySessions)
  }

  // 세션 선택 핸들러
  const handleSessionSelect = (session: ClassSession, selected: boolean) => {
    onSessionSelect?.(session, selected)
  }

  return (
    <div className={`month-calendar ${isCurrentMonth ? 'current-month' : ''}`}>
      {/* 월 헤더 */}
      <div className="month-header">
        <h3 className="text-lg font-semibold text-center py-2">
          {year}년 {month}월
        </h3>
      </div>

      {/* 요일 헤더 */}
      <div className="weekdays-header grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="calendar-grid grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const daySessions = getSessionsForDate(day.date)
          const hasSessions = daySessions.length > 0
          const isSelectable = mode === 'enrollment' || mode === 'modification'
          
          return (
            <div
              key={index}
              className={`
                calendar-day min-h-[60px] p-1 border border-gray-200 rounded
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${hasSessions ? 'cursor-pointer hover:bg-blue-50' : ''}
                ${isCurrentMonth && day.isCurrentMonth ? 'ring-2 ring-blue-200' : ''}
              `}
              onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
            >
              {/* 날짜 번호 */}
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {day.day}
              </div>

              {/* 세션 표시 */}
              {hasSessions && (
                <div className="sessions-container">
                  {mode === 'classes' ? (
                    // 클래스 모드: 점으로 표시
                    <div className="flex flex-wrap gap-1">
                      {daySessions.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title={`${session.class?.className || 'Unknown'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    // enrollment/modification 모드: 세션 정보 표시
                    <div className="space-y-1">
                      {daySessions.map((session, sessionIndex) => {
                        const sessionId = session.id.toString()
                        const isSelected = selectedSessions?.has(sessionId)
                        const isEnrollable = mode === 'enrollment' ? session.isEnrollable : 
                          (session as ClassSessionForModification).isSelectable
                        
                        return (
                          <div
                            key={sessionIndex}
                            className={`
                              text-xs p-1 rounded cursor-pointer
                              ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'}
                              ${!isEnrollable ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isEnrollable) {
                                handleSessionSelect(session, !isSelected)
                              }
                            }}
                          >
                            {session.class?.className || 'Unknown'}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MultiMonthCalendar({
  mode,
  dateRange,
  sessions = [],
  modificationSessions = [],
  onDateClick,
  onSessionSelect,
  onCurrentMonthChange,
  showMonthNavigation = true,
  showYearNavigation = true,
  highlightCurrentMonth = true,
  selectedSessions = new Set(),
  onSelectCountChange,
  onSelectableCountChange
}: MultiMonthCalendarProps) {
  const [currentViewRange, setCurrentViewRange] = useState(dateRange)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 날짜 범위의 모든 월 생성
  const months = useMemo(() => {
    const months: { month: number; year: number }[] = []
    let currentDate = new Date(dateRange.startDate)
    
    while (currentDate <= dateRange.endDate) {
      months.push({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      })
      currentDate = addMonths(currentDate, 1)
    }
    
    return months
  }, [dateRange])

  // 월별 세션 그룹화
  const sessionsByMonth = useMemo(() => {
    const grouped: Record<string, ClassSession[]> = {}
    
    const allSessions = mode === 'modification' ? modificationSessions : sessions
    
    allSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      const monthKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth() + 1}`
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(session)
    })
    
    return grouped
  }, [sessions, modificationSessions, mode])

  // 스크롤 기반 월 네비게이션
  const handleScroll = useCallback((event: React.UIEvent) => {
    const scrollTop = event.currentTarget.scrollTop
    const monthHeight = 400 // 예상 월 높이
    const currentMonthIndex = Math.floor(scrollTop / monthHeight)
    
    if (currentMonthIndex < months.length) {
      const monthInfo = months[currentMonthIndex]
      setCurrentMonth(new Date(monthInfo.year, monthInfo.month - 1))
      onCurrentMonthChange?.(monthInfo.month, monthInfo.year)
    }
  }, [months, onCurrentMonthChange])

  // 월 네비게이션 핸들러
  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' ? 
      subMonths(currentMonth, 1) : 
      addMonths(currentMonth, 1)
    
    setCurrentMonth(newMonth)
    
    // 해당 월로 스크롤
    const monthIndex = months.findIndex(m => 
      m.month === newMonth.getMonth() + 1 && m.year === newMonth.getFullYear()
    )
    
    if (monthIndex >= 0 && scrollContainerRef.current) {
      const monthHeight = 400
      scrollContainerRef.current.scrollTo({
        top: monthIndex * monthHeight,
        behavior: 'smooth'
      })
    }
  }

  // 선택 가능한 세션 수 계산
  useEffect(() => {
    if (onSelectableCountChange) {
      const selectableCount = (mode === 'enrollment' || mode === 'modification') ?
        sessions.filter(s => mode === 'enrollment' ? s.isEnrollable : (s as ClassSessionForModification).isSelectable).length :
        0
      onSelectableCountChange(selectableCount)
    }
  }, [sessions, mode, onSelectableCountChange])

  // 선택된 세션 수 계산
  useEffect(() => {
    if (onSelectCountChange) {
      onSelectCountChange(selectedSessions.size)
    }
  }, [selectedSessions, onSelectCountChange])

  return (
    <div className="multi-month-calendar">
      {/* 월 네비게이션 */}
      {showMonthNavigation && (
        <div className="month-navigation flex items-center justify-between mb-4">
          <button
            onClick={() => handleMonthNavigation('prev')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            이전 월
          </button>
          
          <div className="current-month-display text-lg font-semibold">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </div>
          
          <button
            onClick={() => handleMonthNavigation('next')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            다음 월
          </button>
        </div>
      )}

      {/* 스크롤 가능한 캘린더 */}
      <div 
        ref={scrollContainerRef}
        className="calendar-scroll-container h-[600px] overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="months-container space-y-6">
          {months.map(({ month, year }) => {
            const monthKey = `${year}-${month}`
            const monthSessions = sessionsByMonth[monthKey] || []
            const isCurrentMonth = currentMonth.getMonth() + 1 === month && 
                                 currentMonth.getFullYear() === year
            
            return (
              <MonthCalendar
                key={monthKey}
                month={month}
                year={year}
                sessions={monthSessions}
                mode={mode}
                onDateClick={onDateClick}
                onSessionSelect={onSessionSelect}
                selectedSessions={selectedSessions}
                isCurrentMonth={highlightCurrentMonth && isCurrentMonth}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
} 