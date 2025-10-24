'use client';

import React, { useState, useEffect } from 'react';
import type { CalendarInfo } from '@/types/calendar/CalendarInfo';

interface CalendarSelectionListProps {
  /** 사용 가능한 캘린더 목록 */
  calendars: CalendarInfo[];
  /** 현재 선택된 캘린더 ID */
  selectedCalendarId: string | null;
  /** 캘린더 선택 콜백 */
  onCalendarSelect: (calendarId: string) => void;
  /** 모달 닫기 콜백 */
  onClose: () => void;
}

export function CalendarSelectionList({
  calendars,
  selectedCalendarId,
  onCalendarSelect,
  onClose
}: CalendarSelectionListProps) {
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(selectedCalendarId);

  // 선택된 캘린더 ID가 변경되면 임시 선택도 업데이트
  useEffect(() => {
    setTempSelectedId(selectedCalendarId);
  }, [selectedCalendarId]);

  const handleConfirm = () => {
    if (tempSelectedId) {
      onCalendarSelect(tempSelectedId);
    }
    onClose();
  };


  return (
    <div className="flex flex-col h-full">
      {/* 설명 텍스트 */}
      <div className="mb-4">
        <p className="text-sm text-stone-600">
          수업 일정을 동기화할 캘린더를 선택해주세요
        </p>
      </div>

      {/* 캘린더 목록 */}
      <div className="h-80 overflow-y-auto space-y-2">
        {calendars.map(calendar => {
          const isSelected = tempSelectedId === calendar.id;
          
          return (
            <div
              key={calendar.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[#AC9592] bg-[#AC9592]/10 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
              }`}
              onClick={() => setTempSelectedId(calendar.id)}
            >
              <div className="flex items-center space-x-3">
                {/* 캘린더 색상 표시 */}
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calendar.color }}
                />
                
                {/* 캘린더 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-stone-900 truncate">
                      {calendar.title}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 truncate">
                    {calendar.accountName}
                  </p>
                  {calendar.internalTitle !== calendar.title && (
                    <p className="text-xs text-stone-400 truncate">
                      {calendar.internalTitle}
                    </p>
                  )}
                </div>

                {/* 선택 표시 */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 bg-[#AC9592] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-stone-300 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="flex space-x-3 pt-4 border-t border-stone-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={!tempSelectedId}
          className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#AC9592]/90 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
        >
          선택 완료
        </button>
      </div>
    </div>
  );
}
