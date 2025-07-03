'use client'
import * as React from 'react'
import { useParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDate, isSameMonth, format } from 'date-fns'
import { getClassSessions } from '@/api/class-sessions'
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
}

export default function Calendar({ onSelectCountChange, onSelectableCountChange, onSelectAll, onDeselectAll, isAllSelected, onSelectedClassesChange }: CalendarProps) {
  const params = useParams()
  const month = Number(params.month)
  const year = new Date().getFullYear() // 필요시 쿼리스트링 등에서 받아올 수도 있음

  const [classCards, setClassCards] = useState<any[]>([])
  const [classSessions, setClassSessions] = useState<ClassSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('selectedClassCards')
    if (stored) {
      const cards = JSON.parse(stored)
      setClassCards(cards)
      console.log('classCards in localStorage:', cards)
      
      // 선택된 클래스들의 세션 정보를 가져오기
      loadClassSessions(cards)
    }
  }, [])

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
        if (availableSessions.length > 0) {
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
    } else {
      setSelectedDates({})
    }
  }, [isAllSelected, selectableDates])

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
      
      availableSessions.forEach(session => {
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
    <div className="w-full flex flex-col items-center py-4">
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
          const isSelectable = d.isCurrentMonth && availableSessions.length > 0
          const isSelected = !!selectedDates[dateStr]

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
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-black">{d.day}</span>
                  )
                ) : (
                  <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-zinc-300">{d.day}</span>
                )}
              </div>
              {/* 클래스명: 선택 가능한 날짜만 아래에 표시, 항상 min-h-5로 고정 */}
              <div className="min-h-5 flex flex-col items-center justify-center">
                {isSelectable && availableSessions.map(session => {
                  const classCard = classCards.find(card => card.id === session.classId)
                  return (
                    <div 
                      key={session.id} 
                      className="w-16 h-5 rounded text-xs text-center font-bold -mt-2 flex items-center justify-center"
                      style={{ 
                        backgroundColor: levelBgColor[classCard?.level] || '#AC9592',
                        color: '#573B30',
                        border: 'none',
                        fontFamily: 'Pretendard Variable',
                      }}
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