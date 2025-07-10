'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from './StatusStep';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
  { value: 'SATURDAY', label: '토요일' },
  { value: 'SUNDAY', label: '일요일' },
];

export function CreateClassStep2() {
  const { createClass, setClassFormData, setCreateClassStep } = useDashboardNavigation();
  const { classFormData } = createClass;
  
  const [formData, setFormData] = useState({
    dayOfWeek: classFormData.schedule.days[0] || '',
    startTime: classFormData.schedule.startTime,
    endTime: classFormData.schedule.endTime,
    startDate: classFormData.schedule.startDate || '',
    endDate: classFormData.schedule.endDate || '',
  });

  const handleDaySelect = (day: string) => {
    setFormData(prev => ({
      ...prev,
      dayOfWeek: day,
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
      schedule: {
        days: [formData.dayOfWeek],
        startTime: formData.startTime,
        endTime: formData.endTime,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });
    setCreateClassStep('content');
  };

  const handleBack = () => {
    setCreateClassStep('info');
  };

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '기본 정보',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일정 설정',
      isActive: true,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '강의 내용',
      isActive: false,
      isCompleted: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 헤더 */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          강의 일정을 설정해주세요.
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5">
        <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
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
                    type="button"
                    onClick={() => handleDaySelect(day.value)}
                    className={`px-4 py-3 text-sm border rounded-lg transition-colors ${
                      formData.dayOfWeek === day.value
                        ? 'bg-stone-700 text-white border-stone-700'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                강의 시간 *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <span className="text-stone-500">~</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 강의 기간 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                강의 기간 *
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-stone-600 mb-1">시작일</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleTimeChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-stone-600 mb-1">종료일</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleTimeChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
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
              disabled={!formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.startDate || !formData.endDate}
              className="flex-1 px-4 py-3 text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 