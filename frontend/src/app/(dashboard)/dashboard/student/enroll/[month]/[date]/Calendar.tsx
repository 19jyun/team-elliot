'use client'
import * as React from 'react'
import { useParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDate, isSameMonth } from 'date-fns'

// levelBgColor를 Calendar.tsx 상단에 추가
const levelBgColor: Record<string, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

// 해당 월의 달력 배열을 생성하는 함수
function generateCalendar(year: number, month: number) {
  // month: 1~12
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

const weekDays = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']

interface CalendarProps {
  onSelectCountChange?: (count: number) => void;
  onSelectableCountChange?: (count: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  isAllSelected?: boolean;
}

export default function Calendar({ onSelectCountChange, onSelectableCountChange, onSelectAll, onDeselectAll, isAllSelected }: CalendarProps) {
  const params = useParams()
  const month = Number(params.month)
  const year = new Date().getFullYear() // 필요시 쿼리스트링 등에서 받아올 수도 있음

  // localStorage에서 선택된 클래스 정보 읽기
  const [classCards, setClassCards] = useState<any[]>([])
  useEffect(() => {
    const stored = localStorage.getItem('selectedClassCards')
    if (stored) {
      setClassCards(JSON.parse(stored))
    }
  }, [])

  // useMemo를 사용하는 이유:
  // year/month가 바뀔 때만 달력 배열을 다시 계산하여, 불필요한 연산을 방지합니다.
  const days = useMemo(() => generateCalendar(year, month), [year, month])

  // 날짜 선택 상태: { 'YYYY-MM-DD': true }
  const [selectedDates, setSelectedDates] = useState<{[key: string]: boolean}>({})

  // 날짜를 YYYY-MM-DD 문자열로 변환
  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10)
  }

  // 선택 가능한 모든 날짜 찾기
  const selectableDates = useMemo(() => {
    const dates: string[] = []
    days.forEach(d => {
      if (d.isCurrentMonth) {
        const dayOfWeekIndex = d.date.getDay()
        const dayOfWeekStr = weekDays[dayOfWeekIndex]
        const availableClasses = classCards.filter(card => card.dayOfWeek === dayOfWeekStr)
        if (availableClasses.length > 0) {
          dates.push(formatDate(d.date))
        }
      }
    })
    return dates
  }, [days, classCards])

  // isAllSelected가 변경되면 모든 선택 가능한 날짜를 선택/해제
  useEffect(() => {
    if (isAllSelected) {
      const allSelected = selectableDates.reduce((acc, date) => ({ ...acc, [date]: true }), {})
      setSelectedDates(allSelected)
    } else {
      setSelectedDates({})
    }
  }, [isAllSelected, selectableDates])

  // 선택 가능한 날짜 개수 상위로 전달
  useEffect(() => {
    if (onSelectableCountChange) onSelectableCountChange(selectableDates.length)
  }, [selectableDates, onSelectableCountChange])

  // 선택된 날짜 개수 상위로 전달
  useEffect(() => {
    if (onSelectCountChange) onSelectCountChange(Object.values(selectedDates).filter(Boolean).length)
  }, [selectedDates, onSelectCountChange])

  return (
    <div className="w-full flex flex-col items-center py-4">
      <div className="grid grid-cols-7 gap-2 w-full max-w-lg">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center font-semibold text-stone-500">{day}</div>
        ))}
        {/* 날짜 셀 */}
        {days.map((d, i) => {
          const dayOfWeekIndex = d.date.getDay()
          const dayOfWeekStr = weekDays[dayOfWeekIndex]
          // 이 날짜에 선택 가능한 클래스들
          const availableClasses = d.isCurrentMonth ? classCards.filter(card => card.dayOfWeek === dayOfWeekStr) : []
          const isSelectable = d.isCurrentMonth && availableClasses.length > 0
          const dateKey = formatDate(d.date)
          const isSelected = !!selectedDates[dateKey]

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
                      onClick={() => setSelectedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }))}
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
                {isSelectable && availableClasses.map(card => (
                  <div 
                    key={card.id} 
                    className="w-16 h-5 rounded text-xs text-center font-bold -mt-2 flex items-center justify-center"
                    style={{ 
                      backgroundColor: levelBgColor[card.level] || '#AC9592',
                      color: '#573B30',
                      border: 'none',
                      fontFamily: 'Pretendard Variable',
                    }}
                  >
                    {card.className}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 