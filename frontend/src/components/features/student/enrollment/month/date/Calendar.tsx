'use client'
import * as React from 'react'
import { useParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDate, isSameMonth, format } from 'date-fns'
import { getClassSessions } from '@/api/class-sessions'
import { getClassDetails } from '@/app/api/classes'
import { ClassSession } from '@/types/api/class'

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

interface CalendarProps {
  onSelectCountChange?: (count: number) => void;
  onSelectableCountChange?: (count: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  isAllSelected?: boolean;
  onSelectedClassesChange?: (selected: any[]) => void;
  month?: number; // 월 정보를 props로 받을 수 있도록 추가
  mode?: 'enrollment' | 'modification';
  existingEnrollments?: any[];
}

export default function Calendar({ onSelectCountChange, onSelectableCountChange, onSelectAll, onDeselectAll, isAllSelected, onSelectedClassesChange, month: propMonth, mode = 'enrollment', existingEnrollments }: CalendarProps) {
  const params = useParams()
  const month = propMonth || Number(params.month) // props로 받은 월을 우선 사용, 없으면 URL 파라미터 사용
  const year = new Date().getFullYear() // 필요시 쿼리스트링 등에서 받아올 수도 있음

  const [classCards, setClassCards] = useState<any[]>([])
  const [classSessions, setClassSessions] = useState<ClassSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('selectedClassCards')
    if (stored) {
      const cards = JSON.parse(stored)
      console.log('classCards in localStorage:', cards)
      
      // 실제 클래스 정보를 가져오기
      loadClassDetails(cards)
    }
  }, [])

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
          const sessions = await getClassSessions(card.id)
          // 날짜 형식을 통일하고 해당 월의 세션만 필터링
          const filteredSessions = sessions.filter(session => {
            const sessionDate = new Date(session.date)
            const sessionMonth = sessionDate.getMonth() + 1 // 0-based index
            const sessionYear = sessionDate.getFullYear()
            return sessionMonth === month && sessionYear === year
          })
          allSessions.push(...filteredSessions)
        } catch (error) {
          console.error(`Failed to load sessions for class ${card.id}:`, error)
        }
      }
      
      setClassSessions(allSessions)
      console.log('Loaded class sessions:', allSessions)
    } catch (error) {
      console.error('Failed to load class sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const days = useMemo(() => generateCalendar(year, month), [year, month])
  const [selectedDates, setSelectedDates] = useState<{[key: string]: boolean}>({})

  function formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd')
  }



  // 수강 변경 모드에서 기존 수강 신청 세션들을 미리 선택
  useEffect(() => {
    if (mode === 'modification' && existingEnrollments && existingEnrollments.length > 0) {
      const preSelectedDates: {[key: string]: boolean} = {};
      
      existingEnrollments.forEach((enrollment: any) => {
        if (enrollment.enrollment && 
            (enrollment.enrollment.status === 'CONFIRMED' || enrollment.enrollment.status === 'PENDING')) {
          const dateStr = format(new Date(enrollment.date), 'yyyy-MM-dd');
          preSelectedDates[dateStr] = true;
        }
      });
      
      console.log('기존 수강 신청 세션들 미리 선택:', preSelectedDates);
      setSelectedDates(preSelectedDates);
    }
  }, [mode, existingEnrollments]);

  const selectableDates = useMemo(() => {
    const dates: string[] = []
    days.forEach(d => {
      if (d.isCurrentMonth) {
        const dateStr = formatDate(d.date)
        const availableSessions = classSessions.filter(session => {
          const sessionDate = new Date(session.date)
          const sessionDateStr = format(sessionDate, 'yyyy-MM-dd')
          return sessionDateStr === dateStr
        })
        
        // 수강 가능한 세션이 있는지 확인 (백엔드에서 받은 isEnrollable 사용)
        const hasAvailableSession = availableSessions.some(session => session.isEnrollable)
        
        if (hasAvailableSession) {
          dates.push(dateStr)
        }
      }
    })
    return dates
  }, [days, classSessions])

  useEffect(() => {
    if (isAllSelected) {
      const allSelected = selectableDates.reduce((acc, date) => ({ ...acc, [date]: true }), {})
      setSelectedDates(allSelected)
    } else if (mode !== 'modification') {
      // 수강 변경 모드가 아닐 때만 selectedDates를 초기화
      setSelectedDates({})
    }
    // 수강 변경 모드에서는 기존 선택을 유지
  }, [isAllSelected, selectableDates, mode])

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
      
      // 수강 가능한 세션만 포함 (백엔드에서 받은 isEnrollable 사용)
      const enrollableSessions = availableSessions.filter(session => session.isEnrollable);
      
      enrollableSessions.forEach(session => {
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
          
          // 수강 가능한 세션들만 필터링 (백엔드에서 받은 isEnrollable 사용)
          const enrollableSessions = availableSessions.filter(session => session.isEnrollable)
          
          const isSelectable = d.isCurrentMonth && enrollableSessions.length > 0
          const isSelected = !!selectedDates[dateStr]

          // 수정 모드에서 기존 수강 신청된 세션인지 확인
          const wasOriginallyEnrolled = mode === 'modification' && existingEnrollments?.some((enrollment: any) => {
            const enrollmentDate = format(new Date(enrollment.date), 'yyyy-MM-dd');
            return enrollmentDate === dateStr && 
                   enrollment.enrollment && 
                   (enrollment.enrollment.status === 'CONFIRMED' || enrollment.enrollment.status === 'PENDING');
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
                        ${isSelected ? 'bg-[#573B30] border-[#573B30] text-white' : 'border-[#AC9592] bg-white text-black hover:bg-[#E5D6D1]'}
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
                  const unavailable = !session.isEnrollable
                  
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
                      title={unavailable ? 
                        (session.isPastStartTime ? '이미 시작된 수업' : 
                         session.isFull ? '수강 인원 초과' : 
                         session.isAlreadyEnrolled ? '이미 수강 중' : '수강 불가') 
                        : '수강 가능'
                      }
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