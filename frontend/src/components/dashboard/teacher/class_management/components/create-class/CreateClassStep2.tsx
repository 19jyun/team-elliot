'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

const DAYS_OF_WEEK = [
  { value: 'monday', label: '월요일' },
  { value: 'tuesday', label: '화요일' },
  { value: 'wednesday', label: '수요일' },
  { value: 'thursday', label: '목요일' },
  { value: 'friday', label: '금요일' },
  { value: 'saturday', label: '토요일' },
  { value: 'sunday', label: '일요일' },
];

export function CreateClassStep2() {
  const { createClass, setClassFormData, setCreateClassStep } = useDashboardNavigation();
  const { classFormData } = createClass;
  
  const [formData, setFormData] = useState({
    days: classFormData.schedule.days,
    startTime: classFormData.schedule.startTime,
    endTime: classFormData.schedule.endTime,
  });

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleTimeChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setClassFormData({
      ...classFormData,
      schedule: formData,
    });
    setCreateClassStep('content');
  };

  const handleBack = () => {
    setCreateClassStep('info');
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">강의 일정</h1>
        <p className="mt-2 text-stone-500">
          강의가 진행되는 요일과 시간을 설정해주세요.
        </p>
      </div>

      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        <div className="space-y-6">
          {/* 요일 선택 */}
          <div className="text-left">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              강의 요일 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-4 py-3 text-sm border rounded-lg transition-colors ${
                    formData.days.includes(day.value)
                      ? 'bg-stone-700 text-white border-stone-700'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 설정 */}
          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                시작 시간 *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                종료 시간 *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
          >
            뒤로
          </button>
          <button
            onClick={handleNext}
            disabled={formData.days.length === 0 || !formData.startTime || !formData.endTime}
            className="flex-1 px-4 py-3 text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
} 