import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Wheel from './Wheel';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" 형식
  onChange: (date: string) => void;
  className?: string;
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());

  // 오늘 날짜 계산
  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }, []);

  // 1년 후 날짜 계산
  const oneYearLater = useMemo(() => {
    const later = new Date();
    later.setFullYear(later.getFullYear() + 1);
    return {
      year: later.getFullYear(),
      month: later.getMonth() + 1,
      day: later.getDate()
    };
  }, []);

  // 초기값 설정
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setYear(y || today.year);
      setMonth(m || today.month);
      setDay(d || today.day);
    } else {
      // 값이 없으면 오늘로 설정하고 onChange 호출
      setYear(today.year);
      setMonth(today.month);
      setDay(today.day);
      // 초기값을 onChange로 전달
      const initialDate = `${today.year}-${today.month.toString().padStart(2, '0')}-${today.day.toString().padStart(2, '0')}`;
      onChange(initialDate);
    }
  }, [value, today, onChange]);

  // 해당 월의 마지막 날 계산
  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  }, []);

  // 날짜를 Date 객체로 변환하는 헬퍼 함수
  const dateToDate = useCallback((year: number, month: number, day: number) => {
    return new Date(year, month - 1, day);
  }, []);

  // Date를 문자열로 변환하는 헬퍼 함수
  const dateToString = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 날짜 업데이트 함수
  const updateDate = useCallback((y: number, m: number, d: number) => {
    const dateStr = dateToString(dateToDate(y, m, d));
    onChange(dateStr);
  }, [onChange, dateToString, dateToDate]);

  // 날짜 변경 핸들러
  const handleYearChange = useCallback((index: number) => {
    // 1년 범위로 제한: 현재 년도부터 1년 후까지
    const currentYear = today.year;
    const maxYear = oneYearLater.year;
    const newYear = currentYear + index;
    
    if (newYear >= currentYear && newYear <= maxYear && newYear !== year) {
      setYear(newYear);
      updateDate(newYear, month, day);
    }
  }, [year, month, day, today.year, oneYearLater.year, updateDate]);

  const handleMonthChange = useCallback((index: number) => {
    const newMonth = index + 1;
    if (newMonth !== month) {
      setMonth(newMonth);
      // 월이 변경되면 일도 조정 (범위 내에서)
      const maxDays = getDaysInMonth(year, newMonth);
      let minDay = 1;
      let maxDay = maxDays;
      
      // 현재 년도이고 현재 월인 경우 오늘 이후만 선택 가능
      if (year === today.year && newMonth === today.month) {
        minDay = today.day;
      }
      
      // 1년 후 년도이고 1년 후 월인 경우 1년 후 날짜까지만 선택 가능
      if (year === oneYearLater.year && newMonth === oneYearLater.month) {
        maxDay = oneYearLater.day;
      }
      
      const adjustedDay = Math.max(minDay, Math.min(day, maxDay));
      setDay(adjustedDay);
      updateDate(year, newMonth, adjustedDay);
    }
  }, [year, month, day, today, oneYearLater, updateDate, getDaysInMonth]);

  const handleDayChange = useCallback((index: number) => {
    const newDay = index + 1;
    if (newDay !== day) {
      // 범위 내에서만 선택 가능
      let minDay = 1;
      let maxDay = getDaysInMonth(year, month);
      
      // 현재 년도이고 현재 월인 경우 오늘 이후만 선택 가능
      if (year === today.year && month === today.month) {
        minDay = today.day;
      }
      
      // 1년 후 년도이고 1년 후 월인 경우 1년 후 날짜까지만 선택 가능
      if (year === oneYearLater.year && month === oneYearLater.month) {
        maxDay = oneYearLater.day;
      }
      
      if (newDay >= minDay && newDay <= maxDay) {
        setDay(newDay);
        updateDate(year, month, newDay);
      }
    }
  }, [year, month, day, today, oneYearLater, updateDate, getDaysInMonth]);

  // 포맷팅 함수들
  const formatYear = useCallback((relative: number, absolute: number) => {
    const yearValue = today.year + relative;
    return yearValue.toString();
  }, [today.year]);

  const formatMonth = useCallback((relative: number, absolute: number) => {
    return (relative + 1).toString().padStart(2, '0');
  }, []);

  const formatDay = useCallback((relative: number, absolute: number) => {
    return (relative + 1).toString().padStart(2, '0');
  }, []);

  // 메모이제이션된 값들
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month, getDaysInMonth]);
  const currentYearIndex = useMemo(() => year - today.year, [year, today.year]);
  const currentMonthIndex = useMemo(() => month - 1, [month]);
  const currentDayIndex = useMemo(() => day - 1, [day]);

  // 1년 범위 계산 (현재 년도부터 1년 후까지)
  const yearRange = useMemo(() => {
    return oneYearLater.year - today.year + 1;
  }, [today.year, oneYearLater.year]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 년도 선택 */}
      <div className="w-24 h-48">
        <Wheel
          initIdx={currentYearIndex}
          length={yearRange} // 현재 년도부터 1년 후까지
          width={80}
          loop={false}
          perspective="right"
          setValue={formatYear}
          onChange={handleYearChange}
        />
      </div>
      
      <div className="mx-2 text-xl font-bold text-stone-600">-</div>
      
      {/* 월 선택 */}
      <div className="w-16 h-48">
        <Wheel
          initIdx={currentMonthIndex}
          length={12}
          width={50}
          loop={false}
          perspective="center"
          setValue={formatMonth}
          onChange={handleMonthChange}
        />
      </div>
      
      <div className="mx-2 text-xl font-bold text-stone-600">-</div>
      
      {/* 일 선택 */}
      <div className="w-16 h-48">
        <Wheel
          initIdx={currentDayIndex}
          length={daysInMonth}
          width={50}
          loop={false}
          perspective="left"
          setValue={formatDay}
          onChange={handleDayChange}
        />
      </div>
    </div>
  );
} 