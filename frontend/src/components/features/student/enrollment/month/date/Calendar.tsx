'use client'
import * as React from 'react'
import { useParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDate, isSameMonth, format } from 'date-fns'
import { getClassSessions } from '@/api/class-sessions'
import { getClassDetails } from '@/app/api/classes'
import { ClassSession, ClassSessionForModification } from '@/types/api/class'

// levelBgColor를 Calendar.tsx 상단에 추가
const levelBgColor: Record<string, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

// 해당 월의 달력 배열을 생성하는 함수
function generateCalendar(year: number, month: number) {
  const firstDayOfMonth = startOfMonth(new Date(year, month - 1))
  const lastDayOfMonth = endOfMonth(firstDayOfMonth)
  const firstDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }) // 일요일 시작
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
  return days // 42개(6주) 배열
}

// 날짜 범위의 모든 날짜를 생성하는 함수
function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

interface CalendarProps {
  onSelectCountChange?: (count: number) => void;
  onSelectableCountChange?: (count: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  isAllSelected?: boolean;
  onSelectedClassesChange?: (selected: any[]) => void;
  month?: number; // 월 정보를 props로 받을 수 있도록 추가
  year?: number; // 년도 정보 추가
  mode?: 'enrollment' | 'modification';
  modificationSessions?: ClassSessionForModification[];
  // 월 범위 필터 추가
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  // 현재 보이는 월 표시 (스크롤 기반 캘린더용)
  onCurrentMonthChange?: (month: number, year: number) => void;
}

export default function Calendar({ 
  onSelectCountChange, 
  onSelectableCountChange, 
  onSelectAll, 
  onDeselectAll, 
  isAllSelected, 
  onSelectedClassesChange, 
  month: propMonth, 
  year: propYear,
  mode = 'enrollment', 
  modificationSessions,
  dateRange,
  onCurrentMonthChange
}: CalendarProps) {
  const params = useParams()
  const month = propMonth || Number(params.month) // props로 받은 월을 우선 사용, 없으면 URL 파라미터 사용
  const year = propYear || new Date().getFullYear() // props로 받은 년도를 우선 사용

  const [classCards, setClassCards] = useState<any[]>([])
  const [classSessions, setClassSessions] = useState<ClassSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('selectedClassCards')
    if (stored) {
      const cards = JSON.parse(stored)
      
       loadClassDetails(cards)
    }
  }, [month, year]) // month와 year가 변경될 때마다 다시 로드

  const loadClassDetails = async (cards: any[]) => {
    try {
      // 실제 클래스 정보를 가져오는 API 호출
      const classDetails = await Promise.all(
        cards.map(async (card) => {
          try {
            const details = await getClassDetails(card.id)
            return details
          } catch (error) {
            console.error(`Failed to load class details for ID ${card.id}:`, error)
            return card // 에러 시 기본 정보 사용
          }
        })
      )
      
      setClassCards(classDetails.filter(Boolean)) // null 값 제거
      
      // 선택된 클래스들의 세션 정보를 가져오기
      loadClassSessions(classDetails.filter(Boolean))
    } catch (error) {
      console.error('Failed to load class details:', error)
    }
  }

  const loadClassSessions = async (cards: any[]) => {
    setIsLoadingSessions(true)
    try {
      const allSessions: ClassSession[] = []
      
      for (const card of cards) {
        try {
          let sessions: ClassSession[];
          
          if (mode === 'modification' && modificationSessions) {
            // 수강 변경 모드: props로 받은 modificationSessions 사용
            sessions = modificationSessions;
          } else {
            // 일반 수강 신청 모드: 기존 API 사용
            sessions = await getClassSessions(card.id);
          }
          
          // 날짜 범위 필터링 (dateRange가 있으면 사용, 없으면 기존 월 필터 사용)
          const filteredSessions = sessions.filter(session => {
            const sessionDate = new Date(session.date)
            
            if (dateRange) {
              // 날짜 범위 필터 사용
              return sessionDate >= dateRange.startDate && sessionDate <= dateRange.endDate
            } else {
              // 기존 월 필터 사용
              const sessionMonth = sessionDate.getMonth() + 1 // 0-based index
              const sessionYear = sessionDate.getFullYear()
              return sessionMonth === month && sessionYear === year
            }
          })
          
          allSessions.push(...filteredSessions)
        } catch (error) {
          console.error(`Failed to load sessions for class ${card.id}:`, error)
        }
      }
      
      setClassSessions(allSessions)
    } catch (error) {
      console.error('Failed to load class sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const days = useMemo(() => generateCalendar(year, month), [year, month])
  const [selectedDates, setSelectedDates] = useState<{[key: string]: boolean}>({})

  // 수강 변경 모드에서 기존 수강 신청 세션들을 미리 선택
  React.useEffect(() => {
    if (mode === 'modification' && modificationSessions && modificationSessions.length > 0) {
      const preSelectedDates: {[key: string]: boolean} = {};
      
      modificationSessions.forEach((session) => {
        if (session.canBeCancelled) {
          const dateStr = format(new Date(session.date), 'yyyy-MM-dd');
          preSelectedDates[dateStr] = true;
        }
      });
      
      setSelectedDates(preSelectedDates);
    }
  }, [mode, modificationSessions]);

  function formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd')
  }





  const selectableDates = useMemo(() => {
    const dates: string[] = []
    
    // dateRange가 있으면 해당 범위의 모든 날짜를 확인, 없으면 현재 월만 확인
    const daysToCheck = dateRange ? 
      // 날짜 범위의 모든 날짜 생성
      generateDateRange(dateRange.startDate, dateRange.endDate) :
      // 기존 로직: 현재 월의 날짜만 확인
      days.filter(d => d.isCurrentMonth)
    
    daysToCheck.forEach(d => {
      const dateStr = dateRange ? 
        formatDate(d as Date) : 
        formatDate((d as { date: Date; day: number; isCurrentMonth: boolean }).date)
        
      const availableSessions = classSessions.filter(session => {
        const sessionDate = new Date(session.date)
        const sessionDateStr = format(sessionDate, 'yyyy-MM-dd')
        return sessionDateStr === dateStr
      })
      
      // 수강 가능한 세션이 있는지 확인
      let hasAvailableSession = false;
      
      if (mode === 'modification') {
        // 수강 변경 모드: isSelectable 또는 canBeCancelled인 세션들 확인
        hasAvailableSession = availableSessions.some(session => {
          const modificationSession = session as ClassSessionForModification;
          return modificationSession.isSelectable || modificationSession.canBeCancelled;
        });
      } else {
        // 일반 수강 신청 모드: 기존 isEnrollable 필드 사용
        hasAvailableSession = availableSessions.some(session => session.isEnrollable);
      }
      
      if (hasAvailableSession) {
        dates.push(dateStr)
      }
    })
    return dates
  }, [days, classSessions, dateRange, mode])

  useEffect(() => {
    if (isAllSelected) {
      if (mode === 'modification') {
        // 수강 변경 모드: 기존 수강 신청 세션들 + 선택 가능한 세션들 모두 선택
        const newSelected: {[key: string]: boolean} = {};
        
        // 기존 수강 신청 세션들 추가
        modificationSessions?.forEach(session => {
          if (session.canBeCancelled) {
            const dateStr = format(new Date(session.date), 'yyyy-MM-dd');
            newSelected[dateStr] = true;
          }
        });
        
        // 선택 가능한 세션들 추가
        selectableDates.forEach(date => {
          newSelected[date] = true;
        });
        
        setSelectedDates(newSelected);
      } else {
        // 일반 수강 신청 모드: 모든 선택 가능한 세션 선택
        const allSelected = selectableDates.reduce((acc, date) => ({ ...acc, [date]: true }), {})
        setSelectedDates(allSelected)
      }
          } else {
        if (mode === 'modification') {
          // 수강 변경 모드: 기존 수강 신청 세션들만 유지
          const newSelected: {[key: string]: boolean} = {};
          modificationSessions?.forEach(session => {
            if (session.canBeCancelled) {
              const dateStr = format(new Date(session.date), 'yyyy-MM-dd');
              newSelected[dateStr] = true;
            }
          });
          setSelectedDates(newSelected);
        } else {
          // 일반 수강 신청 모드: 모든 선택 해제
          setSelectedDates({})
        }
      }
  }, [isAllSelected, selectableDates, mode, modificationSessions])

  useEffect(() => {
    if (onSelectableCountChange) onSelectableCountChange(selectableDates.length)
  }, [selectableDates, onSelectableCountChange])

  useEffect(() => {
    if (onSelectCountChange) onSelectCountChange(Object.values(selectedDates).filter(Boolean).length)
  }, [selectedDates, onSelectCountChange])

  useEffect(() => {
    if (!onSelectedClassesChange) return;
    
    // 선택된 날짜의 세션들을 그룹화
    const sessionGroups: Record<string, any> = {};
    
    Object.entries(selectedDates).forEach(([date, isSelected]) => {
      if (!isSelected) return;
      
      const availableSessions = classSessions.filter(session => {
        const sessionDate = new Date(session.date)
        const sessionDateStr = format(sessionDate, 'yyyy-MM-dd')
        return sessionDateStr === date
      });
      
      // 선택 가능한 세션만 포함
      let selectableSessions: ClassSession[] = [];
      
      if (mode === 'modification') {
        // 수강 변경 모드: isSelectable 또는 canBeCancelled인 세션들 포함
        selectableSessions = availableSessions.filter(session => {
          const modificationSession = session as ClassSessionForModification;
          return modificationSession.isSelectable || modificationSession.canBeCancelled;
        });
      } else {
        // 일반 수강 신청 모드: 기존 isEnrollable 필드 사용
        selectableSessions = availableSessions.filter(session => session.isEnrollable);
      }
      
      selectableSessions.forEach(session => {
        const classId = session.classId;
        if (!sessionGroups[classId]) {
          sessionGroups[classId] = {
            class: classCards.find(card => card.id === classId),
            sessions: [],
            numberOfEnrollment: 0,
          };
        }
        sessionGroups[classId].sessions.push(session);
        sessionGroups[classId].numberOfEnrollment += 1;
      });
    });
    
    onSelectedClassesChange(Object.values(sessionGroups));
  }, [selectedDates, classSessions, classCards, onSelectedClassesChange]);

  if (isLoadingSessions) {
    return (
      <div className="w-full flex flex-col items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
        <p className="mt-2 text-sm text-gray-600">세션 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center py-4 px-5">
      <div className="grid grid-cols-7 gap-2 w-full max-w-lg">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center font-semibold text-stone-500">{day}</div>
        ))}
        {/* 날짜 셀 */}
        {days.map((d, i) => {
          const dateStr = formatDate(d.date)
          // 이 날짜에 선택 가능한 세션들
          const availableSessions = d.isCurrentMonth ? classSessions.filter(session => {
            const sessionDate = new Date(session.date)
            const sessionDateStr = format(sessionDate, 'yyyy-MM-dd')
            return sessionDateStr === dateStr
          }) : []
          
                // 선택 가능한 세션들 필터링
      let selectableSessions: ClassSession[] = [];
      
      if (mode === 'modification') {
        // 수강 변경 모드: isSelectable 또는 canBeCancelled인 세션들 포함
        selectableSessions = availableSessions.filter(session => {
          const modificationSession = session as ClassSessionForModification;
          return modificationSession.isSelectable || modificationSession.canBeCancelled;
        });
      } else {
        // 일반 수강 신청 모드: 기존 isEnrollable 필드 사용
        selectableSessions = availableSessions.filter(session => session.isEnrollable);
      }
          
          const isSelectable = d.isCurrentMonth && selectableSessions.length > 0
          const isSelected = !!selectedDates[dateStr]

          // 수정 모드에서 기존 수강 신청된 세션인지 확인
          const wasOriginallyEnrolled = mode === 'modification' && modificationSessions?.some((session) => {
            const sessionDate = format(new Date(session.date), 'yyyy-MM-dd');
            return sessionDate === dateStr && session.canBeCancelled;
          });

          // 취소될 세션인지 확인 (기존에 신청되었지만 현재 선택되지 않은 경우)
          const willBeCancelled = mode === 'modification' && wasOriginallyEnrolled && !isSelected;



          return (
            <div
              key={i}
              className="h-16 flex flex-col items-center justify-between select-none"
            >
              <div className="h-10 flex items-center justify-center">
                {d.isCurrentMonth ? (
                  isSelectable ? (
                    <button
                      type="button"
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-150
                        ${willBeCancelled ? 'bg-white border-red-500 text-red-500' :
                          isSelected ? 'bg-[#573B30] border-[#573B30] text-white' : 
                          'border-[#AC9592] bg-white text-black hover:bg-[#E5D6D1]'}
                      `}
                      onClick={() => setSelectedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }))}
                    >
                      {d.day}
                    </button>
                  ) : availableSessions.length > 0 ? (
                    // 수강 불가능한 세션이 있는 날짜: 회색 배경에 날짜 표시
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white text-base font-medium">
                      {d.day}
                    </div>
                  ) : (
                    // 세션이 없는 날짜: 일반 텍스트
                    <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-black">{d.day}</span>
                  )
                ) : (
                  <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-zinc-300">{d.day}</span>
                )}
              </div>
              {/* 클래스명: 모든 세션을 표시하되, 수강 불가능한 세션은 grey out */}
              <div className="min-h-5 flex flex-col items-center justify-center">
                {availableSessions.map(session => {
                  const classCard = classCards.find(card => card.id === session.classId)
                  let unavailable = false;
                  let title = '';
                  
                  if (mode === 'modification') {
                    const modificationSession = session as ClassSessionForModification;
                    unavailable = !(modificationSession.isSelectable || modificationSession.canBeCancelled);
                    
                    if (unavailable) {
                      if (modificationSession.isPastStartTime) {
                        title = '이미 시작된 수업';
                      } else if (modificationSession.isFull && !modificationSession.isAlreadyEnrolled) {
                        title = '수강 인원 초과';
                      } else if (modificationSession.isAlreadyEnrolled && modificationSession.isPastStartTime) {
                        title = '이미 시작된 수업';
                      } else {
                        title = '수강 불가';
                      }
                    } else {
                      if (modificationSession.isSelectable) {
                        title = '수강 변경 가능';
                      } else if (modificationSession.canBeCancelled) {
                        title = '환불 신청 가능';
                      } else {
                        title = '수정 가능';
                      }
                    }
                  } else {
                    unavailable = !session.isEnrollable;
                    title = unavailable ? 
                      (session.isPastStartTime ? '이미 시작된 수업' : 
                       session.isFull ? '수강 인원 초과' : 
                       session.isAlreadyEnrolled ? '이미 수강 중' : '수강 불가') 
                      : '수강 가능';
                  }
                  
                  return (
                    <div 
                      key={session.id} 
                      className={`w-16 h-5 rounded text-xs text-center font-bold -mt-2 flex items-center justify-center ${
                        unavailable ? 'opacity-50' : ''
                      }`}
                      style={{ 
                        backgroundColor: unavailable 
                          ? '#D3D3D3' 
                          : levelBgColor[classCard?.level] || '#AC9592',
                        color: unavailable ? '#666666' : '#573B30',
                        border: 'none',
                        fontFamily: 'Pretendard Variable',
                      }}
                      title={title}
                    >
                      {classCard?.className || '클래스'}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 