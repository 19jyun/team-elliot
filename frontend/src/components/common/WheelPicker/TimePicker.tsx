import React, { useState, useEffect, useCallback } from 'react';
import Wheel from './Wheel';

interface TimePickerProps {
  value: string; // "HH:MM" 형식
  onChange: (time: string) => void;
  className?: string;
}

export default function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  // 초기값 설정
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHour(Math.max(0, Math.min(23, h || 0)));
      setMinute(Math.max(0, Math.min(59, m || 0)));
    } else {
      // 값이 없으면 기본값으로 설정하고 onChange 호출
      setHour(9);
      setMinute(0);
    }
  }, [value]); 

  // 시간 변경 핸들러 - 디바운싱 적용
  const handleHourChange = useCallback((index: number) => {
    const newHour = Math.max(0, Math.min(23, index));
    if (newHour !== hour) {
      setHour(newHour);
      onChange(`${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }, [hour, minute, onChange]);

  const handleMinuteChange = useCallback((index: number) => {
    const newMinute = Math.max(0, Math.min(59, index));
    if (newMinute !== minute) {
      setMinute(newMinute);
      onChange(`${hour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
    }
  }, [hour, minute, onChange]);

  // 시간 포맷팅 함수
  const formatHour = useCallback((relative: number) => {
    return relative.toString().padStart(2, '0');
  }, []);

  const formatMinute = useCallback((relative: number) => {
    return relative.toString().padStart(2, '0');
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 시간 선택 */}
      <div className="w-20 h-48">
        <Wheel
          initIdx={hour}
          length={24}
          width={23}
          loop={false}
          perspective="right"
          setValue={formatHour}
          onChange={handleHourChange}
        />
      </div>
      
      {/* 구분자 */}
      <div className="mx-3 text-3xl font-bold text-stone-600">:</div>
      
      {/* 분 선택 */}
      <div className="w-20 h-48">
        <Wheel
          initIdx={minute}
          length={60}
          width={23}
          loop={false}
          perspective="left"
          setValue={formatMinute}
          onChange={handleMinuteChange}
        />
      </div>
    </div>
  );
} 