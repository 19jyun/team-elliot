'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import type { CalendarMode } from '@/contexts/CalendarContext';
import { ClassSession } from '@/types/api/class';

// levelBgColor와 levelTextColor를 추가 (기존 캘린더와 동일)
const levelBgColor: Record<string, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
};

const levelTextColor: Record<string, string> = {
  BEGINNER: '#8B4513', // 진한 갈색
  INTERMEDIATE: '#DAA520', // 골든로드
  ADVANCED: '#2F4F4F', // 다크슬레이트그레이
};

export function ConnectedCalendar() {
  const {
    mode,
    sessions,
    selectedSessionIds,
    focusedMonth,
    calendarRange,
    onMonthChange,
    updateFocusedMonth,
    onSessionSelect,
    onDateClick,
    getSessionDisplayInfo,
  } = useCalendarContext();

  // 타입 오류 방지용
  const calendarMode: CalendarMode = mode;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState(focusedMonth);
  const [isScrolling, setIsScrolling] = useState(false);

  // 캘린더 범위 제한 계산
  const calendarBounds = useMemo(() => {
    if (!calendarRange) return null;
    
    const startYear = calendarRange.startDate.getFullYear();
    const startMonth = calendarRange.startDate.getMonth() + 1;
    const endYear = calendarRange.endDate.getFullYear();
    const endMonth = calendarRange.endDate.getMonth() + 1;
    
    return { startYear, startMonth, endYear, endMonth };
  }, [calendarRange]);

  // 완전히 연결된 캘린더를 위한 연속적인 날짜들 생성 (완전한 6주 구조)
  const continuousCalendarDays = useMemo(() => {
    const allDays = [];
    
    if (calendarBounds) {
      // 실제 캘린더 범위를 사용하여 연속된 캘린더 생성
      const startDate = new Date(calendarBounds.startYear, calendarBounds.startMonth - 1, 1);
      const endDate = new Date(calendarBounds.endYear, calendarBounds.endMonth, 0);
      
      // 7월 1일의 주 시작 날짜 계산 (일요일부터 시작)
      const startPadding = startDate.getDay();
      const calendarStartDate = new Date(startDate);
      calendarStartDate.setDate(calendarStartDate.getDate() - startPadding);
      
      // 8월 31일 이후의 주 끝 날짜 계산 (토요일까지)
      const endPadding = 6 - endDate.getDay();
      const calendarEndDate = new Date(endDate);
      calendarEndDate.setDate(calendarEndDate.getDate() + endPadding);
      
      // 전체 캘린더 날짜 생성
      const currentDate = new Date(calendarStartDate);
      while (currentDate <= calendarEndDate) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        
        // 현재 날짜가 캘린더 범위 내인지 확인
        const isInRangeMonth = (currentMonth >= calendarBounds.startMonth && currentMonth <= calendarBounds.endMonth && currentYear === calendarBounds.startYear) ||
                              (currentMonth >= calendarBounds.startMonth && currentMonth <= calendarBounds.endMonth && currentYear === calendarBounds.endYear);
        
        // 세션 데이터에서 해당 날짜의 세션들 필터링 (시간대 문제 해결)
        const daySessions = sessions.filter(session => {
          const sessionDate = new Date(session.date);
          // 로컬 시간대로 날짜 비교
          return sessionDate.getFullYear() === currentYear &&
                 sessionDate.getMonth() + 1 === currentMonth &&
                 sessionDate.getDate() === currentDay;
        });
        
        allDays.push({
          date: new Date(currentDate),
          day: currentDay,
          isCurrentMonth: isInRangeMonth,
          month: currentMonth,
          year: currentYear,
          sessions: daySessions,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // 캘린더 범위가 없는 경우 기본 로직 사용
      const firstDayOfMonth = new Date(focusedMonth.year, focusedMonth.month - 1, 1);
      const startPadding = firstDayOfMonth.getDay();
      
      const calendarStartDate = new Date(firstDayOfMonth);
      calendarStartDate.setDate(calendarStartDate.getDate() - startPadding);
      
      // 42일(6주) 생성
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(calendarStartDate);
        currentDate.setDate(calendarStartDate.getDate() + i);
        
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        
        const daySessions = sessions.filter(session => {
          const sessionDate = new Date(session.date);
          // 로컬 시간대로 날짜 비교
          return sessionDate.getFullYear() === currentYear &&
                 sessionDate.getMonth() + 1 === currentMonth &&
                 sessionDate.getDate() === currentDay;
        });
        
        allDays.push({
          date: currentDate,
          day: currentDay,
          isCurrentMonth: currentMonth === focusedMonth.month && currentYear === focusedMonth.year,
          month: currentMonth,
          year: currentYear,
          sessions: daySessions,
        });
      }
    }
    
    return allDays;
  }, [focusedMonth, sessions, calendarBounds]);

  // 스크롤 위치에 따른 월 감지 및 업데이트 (감도 조정)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      setIsScrolling(true);
      
      // 스크롤 중에는 업데이트하지 않음
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const scrollCenter = scrollTop + containerHeight / 2;
        
        // 스크롤 위치에 따라 현재 보이는 월 계산
        const weekHeight = 80; // 주당 높이
        const weekIndex = Math.floor(scrollCenter / weekHeight);
        
        // 캘린더 범위 내에서만 월 변경 허용
        if (calendarBounds) {
          // 실제 캘린더 범위를 기반으로 월 계산
          const totalWeeks = Math.ceil((calendarBounds.endMonth - calendarBounds.startMonth + 1) * 4.33); // 월당 약 4.33주
          const weekRatio = weekIndex / totalWeeks;
          
          let newMonth, newYear;
          
          if (calendarBounds.startYear === calendarBounds.endYear) {
            // 같은 년도 내에서
            const monthDiff = calendarBounds.endMonth - calendarBounds.startMonth;
            const targetMonthIndex = Math.floor(weekRatio * (monthDiff + 1));
            newMonth = calendarBounds.startMonth + targetMonthIndex;
            newYear = calendarBounds.startYear;
          } else {
            // 년도가 다른 경우 (복잡한 경우는 나중에 처리)
            newMonth = calendarBounds.startMonth;
            newYear = calendarBounds.startYear;
          }
          
          if (newMonth !== currentVisibleMonth.month || newYear !== currentVisibleMonth.year) {
            setCurrentVisibleMonth({ year: newYear, month: newMonth });
            updateFocusedMonth(newYear, newMonth);
          }
        } else {
          // 캘린더 범위가 없는 경우 기존 로직 사용
          const monthIndex = Math.floor(weekIndex / 6); // 6주 = 1개월
          const newMonth = focusedMonth.month + (monthIndex - 1);
          let newYear = focusedMonth.year;
          
          if (newMonth < 1) {
            newYear = focusedMonth.year - 1;
            const adjustedMonth = 12 + newMonth;
            if (adjustedMonth !== currentVisibleMonth.month || newYear !== currentVisibleMonth.year) {
              setCurrentVisibleMonth({ year: newYear, month: adjustedMonth });
              updateFocusedMonth(newYear, adjustedMonth);
            }
          } else if (newMonth > 12) {
            newYear = focusedMonth.year + 1;
            const adjustedMonth = newMonth - 12;
            if (adjustedMonth !== currentVisibleMonth.month || newYear !== currentVisibleMonth.year) {
              setCurrentVisibleMonth({ year: newYear, month: adjustedMonth });
              updateFocusedMonth(newYear, adjustedMonth);
            }
          } else {
            if (newMonth !== currentVisibleMonth.month) {
              setCurrentVisibleMonth({ year: newYear, month: newMonth });
              updateFocusedMonth(newYear, newMonth);
            }
          }
        }
      }, 150); // 스크롤이 끝난 후 150ms 후에 업데이트
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [focusedMonth, currentVisibleMonth, updateFocusedMonth, calendarBounds]);

  // focusedMonth가 변경되면 currentVisibleMonth도 업데이트
  useEffect(() => {
    setCurrentVisibleMonth(focusedMonth);
  }, [focusedMonth]);

  // 요일 헤더
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDateClick = (dayInfo: any) => {
    // student-view 모드에서는 날짜 클릭 시 모달 열기
    if (calendarMode === 'student-view' || calendarMode === 'teacher-view') {
      if (dayInfo.sessions.length > 0) {
        // 로컬 시간대로 날짜 문자열 생성 (YYYY-MM-DD 형식)
        const year = dayInfo.date.getFullYear();
        const month = String(dayInfo.date.getMonth() + 1).padStart(2, '0');
        const day = String(dayInfo.date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        onDateClick(dateString);
      }
      return;
    }
    
    // enrollment/modification 모드에서는 기존 로직 유지
    if (dayInfo.sessions.length > 0) {
      const selectableSessions = dayInfo.sessions.filter((session: ClassSession) => {
        const displayInfo = getSessionDisplayInfo(session);
        return displayInfo.isSelectable;
      });
      
      if (selectableSessions.length > 0) {
        selectableSessions.forEach((session: ClassSession) => {
          onSessionSelect(session.id);
        });
      }
    }
  };

  const handleSessionClick = (session: ClassSession, event: React.MouseEvent) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    
    // student-view/teacher-view 모드에서는 세션 클릭 시 모달 열기
    if (calendarMode === 'student-view' || calendarMode === 'teacher-view') {
      // 해당 날짜의 모든 세션을 모달에 전달하기 위해 날짜 클릭 핸들러 호출
      const dateString = session.date;
      onDateClick(dateString);
      return;
    }
    
    // enrollment/modification 모드에서는 기존 로직 유지
    onSessionSelect(session.id);
  };

  const handleNavigationClick = (direction: 'prev' | 'next') => {
    // 캘린더 범위 내에서만 네비게이션 허용
    if (calendarBounds) {
      const currentMonthIndex = (currentVisibleMonth.year - calendarBounds.startYear) * 12 + (currentVisibleMonth.month - calendarBounds.startMonth);
      const newMonthIndex = direction === 'prev' ? currentMonthIndex - 1 : currentMonthIndex + 1;
      
      const totalMonths = (calendarBounds.endYear - calendarBounds.startYear) * 12 + (calendarBounds.endMonth - calendarBounds.startMonth + 1);
      if (newMonthIndex >= 0 && newMonthIndex < totalMonths) {
        onMonthChange(direction);
      }
    } else {
      onMonthChange(direction);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 - 년/월 표시 및 네비게이션 */}
      <div className="flex items-center justify-between px-7 pt-3 pb-2 w-full text-base font-semibold relative bg-white">
        <button
          onClick={() => handleNavigationClick('prev')}
          disabled={!!(calendarBounds && currentVisibleMonth.month === calendarBounds.startMonth && currentVisibleMonth.year === calendarBounds.startYear)}
          className={`p-2 transition-colors ${
            calendarBounds && currentVisibleMonth.month === calendarBounds.startMonth && currentVisibleMonth.year === calendarBounds.startYear
              ? 'text-stone-300 cursor-not-allowed'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        
        <div className="text-stone-700">
          {currentVisibleMonth.year}년 {currentVisibleMonth.month}월
        </div>
        
        <button
          onClick={() => handleNavigationClick('next')}
          disabled={!!(calendarBounds && currentVisibleMonth.month === calendarBounds.endMonth && currentVisibleMonth.year === calendarBounds.endYear)}
          className={`p-2 transition-colors ${
            calendarBounds && currentVisibleMonth.month === calendarBounds.endMonth && currentVisibleMonth.year === calendarBounds.endYear
              ? 'text-stone-300 cursor-not-allowed'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 - 정확한 정렬 */}
      <div className="flex justify-around px-2.5 w-full text-sm font-medium bg-white">
        {weekDays.map(day => (
          <div key={day} className="w-[50px] py-2 text-stone-700 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* 완전히 연결된 캘린더 그리드 - 스크롤 가능 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div className="flex flex-col w-full text-base pb-4">
          {Array.from({ length: Math.ceil(continuousCalendarDays.length / 7) }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex justify-around px-2.5 mt-1">
              {continuousCalendarDays
                .slice(weekIndex * 7, (weekIndex + 1) * 7)
                .map((dayInfo, dayIndex) => {
                  const hasSessions = dayInfo.sessions.length > 0;
                  const isCurrentFocusedMonth = dayInfo.month === currentVisibleMonth.month && dayInfo.year === currentVisibleMonth.year;
                  
                  // 선택 가능한 세션들 필터링
                  const selectableSessions = dayInfo.sessions.filter((session: ClassSession) => {
                    const displayInfo = getSessionDisplayInfo(session);
                    return displayInfo.isSelectable;
                  });
                  
                  const isSelectable = dayInfo.isCurrentMonth && selectableSessions.length > 0;
                  const isSelected = dayInfo.sessions.some((session: ClassSession) => 
                    selectedSessionIds.has(session.id)
                  );

                  // modification 모드에서 취소될 예정인 세션 확인 (기존에 신청되었지만 현재 선택되지 않은 경우)
                  const willBeCancelled = calendarMode === 'modification' && dayInfo.sessions.some((session: ClassSession) => {
                    if ('canBeCancelled' in session && session.canBeCancelled) {
                      // 기존에 신청된 세션이지만 현재 선택되지 않은 경우
                      return !selectedSessionIds.has(session.id);
                    }
                    return false;
                  });

                  return (
                    <div
                      key={dayIndex}
                      className="w-[50px] h-16 flex flex-col items-center justify-between select-none"
                    >
                      {/* 날짜 - 기존 캘린더와 동일한 디자인 */}
                      <div className="h-10 flex items-center justify-center">
                        {dayInfo.isCurrentMonth ? (
                          isSelectable ? (
                            <button
                              type="button"
                              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-150
                                ${willBeCancelled ? 'bg-white border-red-500 text-red-500' :
                                  isSelected ? 'bg-[#573B30] border-[#573B30] text-white' : 
                                  isCurrentFocusedMonth 
                                    ? 'border-[#AC9592] bg-white text-black hover:bg-[#E5D6D1]'
                                    : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-200'}
                              `}
                              onClick={() => handleDateClick(dayInfo)}
                            >
                              {dayInfo.day}
                            </button>
                          ) : hasSessions ? (
                            // student-view/teacher-view 모드에서는 클릭 가능한 버튼으로 표시 (채워지지 않은 원)
                            calendarMode === 'student-view' || calendarMode === 'teacher-view' ? (
                                                          <button
                              type="button"
                              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-base font-medium transition-all duration-150 cursor-pointer ${
                                isCurrentFocusedMonth 
                                  ? 'border-[#573B30] text-[#573B30] hover:bg-[#573B30] hover:text-white' 
                                  : 'border-gray-300 text-gray-400 hover:bg-gray-300 hover:text-white'
                              }`}
                              onClick={() => handleDateClick(dayInfo)}
                            >
                                {dayInfo.day}
                              </button>
                            ) : (
                              // enrollment/modification 모드에서는 기존처럼 회색 배경
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white text-base font-medium">
                                {dayInfo.day}
                              </div>
                            )
                          ) : (
                            // 세션이 없는 날짜: focused month에 따라 색상 변경
                            <span className={`w-10 h-10 flex items-center justify-center text-base font-medium transition-colors duration-300 ${
                              isCurrentFocusedMonth ? 'text-black' : 'text-gray-400'
                            }`}>
                              {dayInfo.day}
                            </span>
                          )
                        ) : (
                          // 범위 밖의 날짜: 회색으로 표시
                          <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-gray-300 transition-colors duration-300">
                            {dayInfo.day}
                          </span>
                        )}
                      </div>
                      
                      {/* 클래스명 - teacher-view에서는 표시하지 않음, 나머지는 기존 방식 */}
                      <div className="min-h-5 flex flex-col items-center justify-center">
                        {String(calendarMode) !== 'teacher-view' && dayInfo.sessions.map(session => {
                          const displayInfo = getSessionDisplayInfo(session);
                          const unavailable = !displayInfo.isSelectable;
                          const title = displayInfo.displayText;
                          
                          return (
                            <div 
                              key={session.id} 
                              className={`w-16 h-5 rounded text-xs text-center font-bold -mt-2 flex items-center justify-center ${
                                unavailable ? 'opacity-50' : ''
                              } ${
                                calendarMode === 'student-view' ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer'
                              }`}
                              style={{ 
                                backgroundColor: unavailable 
                                  ? '#D3D3D3' 
                                  : levelBgColor[session.class?.level || ''] || '#AC9592',
                                color: unavailable 
                                  ? '#666666' 
                                  : levelTextColor[session.class?.level || ''] || '#573B30',
                                border: 'none',
                                fontFamily: 'Pretendard Variable',
                                opacity: isCurrentFocusedMonth ? 1 : 0.5, // focused month가 아닌 경우 투명도 적용
                                transition: 'opacity 0.3s ease-in-out', // transition 추가
                              }}
                              title={title}
                              onClick={(e) => handleSessionClick(session, e)}
                            >
                              {session.class?.className || '클래스'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 