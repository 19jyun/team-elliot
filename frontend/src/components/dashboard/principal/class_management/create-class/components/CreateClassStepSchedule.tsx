'use client';

import React, { useState } from 'react';
import { useImprovedApp } from '@/contexts/ImprovedAppContext';
import { StatusStep } from './StatusStep';
import { toast } from 'sonner';
import TimePicker from '@/components/common/WheelPicker/TimePicker';
import DatePicker from '@/components/common/WheelPicker/DatePicker';
import { SlideUpModal } from '@/components/common/SlideUpModal';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
  { value: 'SATURDAY', label: '토요일' },
  { value: 'SUNDAY', label: '일요일' },
];

export function CreateClassStepSchedule() {
  const { form } = useImprovedApp();
  const { createClass } = form;
  const { setClassFormData, setCurrentStep } = createClass;
  const { classFormData } = createClass.state;

  const [formData, setFormData] = useState({
    days: classFormData.schedule.days || [],
    startTime: classFormData.schedule.startTime || '',
    endTime: classFormData.schedule.endTime || '',
    startDate: classFormData.schedule.startDate || '',
    endDate: classFormData.schedule.endDate || '',
  });

  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };



  // 필수 필드 검증 함수
  const isFormValid = () => {
    return (
      formData.days.length > 0 &&
      !!formData.startTime &&
      !!formData.endTime &&
      !!formData.startDate &&
      !!formData.endDate
    );
  };

  const handleNext = () => {
    // 필수 필드 검증
    if (formData.days.length === 0) {
      toast.error('요일을 선택해주세요.');
      return;
    }
    if (!formData.startTime) {
      toast.error('시작 시간을 선택해주세요.');
      return;
    }
    if (!formData.endTime) {
      toast.error('종료 시간을 선택해주세요.');
      return;
    }
    if (!formData.startDate) {
      toast.error('강의 시작일을 선택해주세요.');
      return;
    }
    if (!formData.endDate) {
      toast.error('강의 종료일을 선택해주세요.');
      return;
    }

    // 시간 유효성 검증 - 시작 시간이 종료 시간보다 이전이어야 함
    if (formData.startTime >= formData.endTime) {
      toast.error('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    // 날짜 유효성 검증 - 시작일이 종료일보다 이전이어야 함
    if (formData.startDate >= formData.endDate) {
      toast.error('강의 종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    // 날짜 범위 검증 - 최대 1년 이내
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const oneYearLater = new Date(startDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    if (endDate > oneYearLater) {
      toast.error('강의 기간은 최대 1년까지 설정 가능합니다.');
      return;
    }

    // 오늘 이후 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      toast.error('강의 시작일은 오늘 이후로 설정해주세요.');
      return;
    }

    // DashboardContext의 createClass 상태 업데이트
    setClassFormData({
      ...classFormData,
      schedule: {
        days: formData.days,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });
    setCurrentStep('content');
  };

  const handleBack = () => {
    setCurrentStep('teacher');
  };

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '기본 정보',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '선생님 지정',
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
      <main className="flex-1 min-h-0 bg-white px-5 overflow-y-auto">
        <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
          <div className="space-y-6">
            {/* 요일 선택 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                요일 선택 *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                      formData.days.includes(day.value)
                        ? 'bg-[#AC9592] text-white border-[#AC9592]'
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
              <div className="grid grid-cols-2 gap-3">
                {/* 시작 시간 */}
                <div>
                  <label className="block text-xs text-stone-600 mb-1">시작 시간</label>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker('start')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg text-left hover:border-stone-500 transition-colors"
                  >
                    {formData.startTime || '시간 선택'}
                  </button>
                </div>

                {/* 종료 시간 */}
                <div>
                  <label className="block text-xs text-stone-600 mb-1">종료 시간</label>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker('end')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg text-left hover:border-stone-500 transition-colors"
                  >
                    {formData.endTime || '시간 선택'}
                  </button>
                </div>
              </div>
            </div>

            {/* 강의 기간 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                강의 기간 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* 시작일 */}
                <div>
                  <label className="block text-xs text-stone-600 mb-1">시작일</label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker('start')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg text-left hover:border-stone-500 transition-colors"
                  >
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString('ko-KR') : '날짜 선택'}
                  </button>
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-xs text-stone-600 mb-1">종료일</label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker('end')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg text-left hover:border-stone-500 transition-colors"
                  >
                    {formData.endDate ? new Date(formData.endDate).toLocaleDateString('ko-KR') : '날짜 선택'}
                  </button>
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
              disabled={!isFormValid()}
              className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </main>

      {/* 시간 선택 Slide Up Modal */}
      <SlideUpModal
        isOpen={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        title={showTimePicker === 'start' ? '시작 시간 선택' : '종료 시간 선택'}
      >
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
            <TimePicker
              value={showTimePicker === 'start' ? (formData.startTime || '09:00') : (formData.endTime || '10:00')}
              onChange={(time) => {
                if (showTimePicker === 'start') {
                  setFormData(prev => ({ ...prev, startTime: time }));
                } else {
                  setFormData(prev => ({ ...prev, endTime: time }));
                }
              }}
            />
          </div>
          <div className="flex gap-3 w-full pb-3">
            <button
              onClick={() => setShowTimePicker(null)}
              className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={() => setShowTimePicker(null)}
              className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* 날짜 선택 Slide Up Modal */}
      <SlideUpModal
        isOpen={showDatePicker !== null}
        onClose={() => setShowDatePicker(null)}
        title={showDatePicker === 'start' ? '시작일 선택' : '종료일 선택'}
      >
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
            <DatePicker
              value={showDatePicker === 'start' 
                ? (formData.startDate || new Date().toISOString().split('T')[0])
                : (formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
              }
              onChange={(date) => {
                if (showDatePicker === 'start') {
                  setFormData(prev => ({ ...prev, startDate: date }));
                } else {
                  setFormData(prev => ({ ...prev, endDate: date }));
                }
              }}
            />
          </div>
          <div className="flex gap-3 w-full pb-3">
            <button
              onClick={() => setShowDatePicker(null)}
              className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={() => setShowDatePicker(null)}
              className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </SlideUpModal>
    </div>
  );
} 