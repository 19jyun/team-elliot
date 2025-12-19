'use client';

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { StatusStep } from './StatusStep';
import { useApp } from '@/contexts/AppContext';
import { classScheduleSchema, ClassScheduleSchemaType } from '@/lib/schemas/class-create';
import TimePicker from '@/components/common/WheelPicker/TimePicker';
import DatePicker from '@/components/common/WheelPicker/DatePicker';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { ensureTrailingSlash } from '@/lib/utils/router';

// 요일 매핑: 문자열 -> 숫자 (0: 일요일 ~ 6: 토요일)
const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '월요일', dayOfWeek: 1 },
  { value: 'TUESDAY', label: '화요일', dayOfWeek: 2 },
  { value: 'WEDNESDAY', label: '수요일', dayOfWeek: 3 },
  { value: 'THURSDAY', label: '목요일', dayOfWeek: 4 },
  { value: 'FRIDAY', label: '금요일', dayOfWeek: 5 },
  { value: 'SATURDAY', label: '토요일', dayOfWeek: 6 },
  { value: 'SUNDAY', label: '일요일', dayOfWeek: 0 },
];

export function CreateClassStepSchedule() {
  const router = useRouter();
  const { form, setPrincipalClassFormData } = useApp();
  const { principalCreateClass } = form;
  const { classFormData } = principalCreateClass;

  // 기존 데이터를 스키마 형식으로 변환
  const defaultSchedules = useMemo(() => {
    if (classFormData.schedule && classFormData.schedule.length > 0) {
      return classFormData.schedule;
    }
    // 기본값: 빈 배열 (사용자가 요일 선택 후 추가)
    return [];
  }, [classFormData.schedule]);

  // React Hook Form 설정
  const { control, handleSubmit, formState: { isValid, errors }, setValue, watch, trigger } = useForm<ClassScheduleSchemaType>({
    resolver: zodResolver(classScheduleSchema),
    defaultValues: {
      startDate: classFormData.startDate || '',
      endDate: classFormData.endDate || '',
      schedules: defaultSchedules,
    },
    mode: 'onChange', // 실시간 검증
    reValidateMode: 'onChange',
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const watchedSchedules = watch('schedules');

  // 선택된 요일들을 문자열 배열로 변환 (UI용)
  const selectedDays = useMemo(() => {
    return watchedSchedules.map(s => {
      const day = DAYS_OF_WEEK.find(d => d.dayOfWeek === s.dayOfWeek);
      return day?.value || '';
    }).filter(Boolean);
  }, [watchedSchedules]);

  // 단일 시간 (모든 요일에 동일하게 적용)
  const [startTime, setStartTime] = useState(
    watchedSchedules.length > 0 ? watchedSchedules[0].startTime : '09:00'
  );
  const [endTime, setEndTime] = useState(
    watchedSchedules.length > 0 ? watchedSchedules[0].endTime : '10:00'
  );

  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  // 요일 토글: 선택/해제 시 schedules 배열 업데이트
  const handleDayToggle = (dayValue: string) => {
    const dayInfo = DAYS_OF_WEEK.find(d => d.value === dayValue);
    if (!dayInfo) return;

    const existingIndex = watchedSchedules.findIndex(s => s.dayOfWeek === dayInfo.dayOfWeek);
    
    if (existingIndex >= 0) {
      // 제거
      const newSchedules = watchedSchedules.filter((_, idx) => idx !== existingIndex);
      setValue('schedules', newSchedules, { shouldValidate: true });
      trigger('schedules');
    } else {
      // 추가 (현재 설정된 시간 사용)
      const newSchedule = {
        dayOfWeek: dayInfo.dayOfWeek,
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
      };
      setValue('schedules', [...watchedSchedules, newSchedule], { shouldValidate: true });
      trigger('schedules');
    }
  };

  // 시간 변경 시 모든 schedule 항목 업데이트
  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    if (type === 'start') {
      setStartTime(time);
      const updatedSchedules = watchedSchedules.map(s => ({ ...s, startTime: time }));
      setValue('schedules', updatedSchedules, { shouldValidate: true });
      trigger('schedules');
    } else {
      setEndTime(time);
      const updatedSchedules = watchedSchedules.map(s => ({ ...s, endTime: time }));
      setValue('schedules', updatedSchedules, { shouldValidate: true });
      trigger('schedules');
    }
  };
  const onNext = (data: ClassScheduleSchemaType) => {
    // 추가 검증: 시간 유효성
    if (data.schedules.length > 0) {
      const firstSchedule = data.schedules[0];
      if (firstSchedule.startTime >= firstSchedule.endTime) {
        // Zod refine으로 처리되지만, 추가 확인
        return;
      }
    }

    // 날짜 범위 검증 - 최대 1년 이내
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const oneYearLater = new Date(startDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    if (endDate > oneYearLater) {
      // toast는 스키마 검증에서 처리
      return;
    }

    // 오늘 이후 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      // toast는 스키마 검증에서 처리
      return;
    }

    // Context 업데이트
    setPrincipalClassFormData({
      ...classFormData,
      startDate: data.startDate,
      endDate: data.endDate,
      schedule: data.schedules,
    });
    
    // 다음 단계로 이동
    router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info/teacher/schedule/content'));
  };

  const handleBack = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info/teacher'));
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

      {/* 메인 콘텐츠 - 고정 높이 + 스크롤 */}
      <main className="flex-shrink-0 overflow-y-auto px-5" style={{ height: 'calc(100vh - 400px)' }}>
        <form id="create-class-schedule-form" onSubmit={handleSubmit(onNext)} className="flex flex-col">
          <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto pb-4">
            <div className="space-y-6">
              {/* 요일 선택 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  요일 선택 *
                </label>
                <Controller
                  name="schedules"
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleDayToggle(day.value)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              selectedDays.includes(day.value)
                                ? 'bg-[#AC9592] text-white border-[#AC9592]'
                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500">{error.message}</p>
                      )}
                      {/* schedules 배열 자체의 에러 (예: 최소 1개 필요) */}
                      {errors.schedules && typeof errors.schedules === 'object' && 'message' in errors.schedules && (
                        <p className="mt-2 text-sm text-red-500">{errors.schedules.message as string || '일정을 선택해주세요.'}</p>
                      )}
                    </>
                  )}
                />
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
                      className={`w-full px-4 py-3 border rounded-lg text-left hover:border-stone-500 transition-colors ${
                        errors.schedules && Array.isArray(errors.schedules) && errors.schedules.some(e => e?.startTime) 
                          ? 'border-red-500' 
                          : 'border-stone-300'
                      }`}
                    >
                      {startTime || '시간 선택'}
                    </button>
                  </div>

                  {/* 종료 시간 */}
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">종료 시간</label>
                    <button
                      type="button"
                      onClick={() => setShowTimePicker('end')}
                      className={`w-full px-4 py-3 border rounded-lg text-left hover:border-stone-500 transition-colors ${
                        errors.schedules && Array.isArray(errors.schedules) && errors.schedules.some(e => e?.endTime) 
                          ? 'border-red-500' 
                          : 'border-stone-300'
                      }`}
                    >
                      {endTime || '시간 선택'}
                    </button>
                  </div>
                </div>
                {/* 시간 관련 에러 메시지 */}
                {errors.schedules && Array.isArray(errors.schedules) && errors.schedules.some(e => e) && (
                  <div className="mt-2 space-y-1">
                    {errors.schedules.map((scheduleError, index) => {
                      if (!scheduleError) return null;
                      const schedule = watchedSchedules[index];
                      const dayLabel = DAYS_OF_WEEK.find(d => d.dayOfWeek === schedule?.dayOfWeek)?.label || '';
                      if (scheduleError.endTime?.message) {
                        return (
                          <p key={index} className="text-sm text-red-500">
                            {dayLabel}: {scheduleError.endTime.message}
                          </p>
                        );
                      }
                      if (scheduleError.startTime?.message) {
                        return (
                          <p key={index} className="text-sm text-red-500">
                            {dayLabel}: {scheduleError.startTime.message}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
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
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker('start')}
                            className={`w-full px-4 py-3 border rounded-lg text-left hover:border-stone-500 transition-colors ${
                              error || errors.startDate ? 'border-red-500' : 'border-stone-300'
                            }`}
                          >
                            {field.value ? new Date(field.value).toLocaleDateString('ko-KR') : '날짜 선택'}
                          </button>
                          {error && (
                            <p className="mt-1 text-xs text-red-500">{error.message}</p>
                          )}
                          {/* refine 에러도 표시 */}
                          {errors.endDate && errors.endDate.type === 'custom' && (
                            <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* 종료일 */}
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">종료일</label>
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker('end')}
                            className={`w-full px-4 py-3 border rounded-lg text-left hover:border-stone-500 transition-colors ${
                              error || errors.endDate ? 'border-red-500' : 'border-stone-300'
                            }`}
                          >
                            {field.value ? new Date(field.value).toLocaleDateString('ko-KR') : '날짜 선택'}
                          </button>
                          {error && (
                            <p className="mt-1 text-xs text-red-500">{error.message}</p>
                          )}
                          {/* refine 에러도 표시 */}
                          {errors.endDate && errors.endDate.type === 'custom' && (
                            <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Footer - 버튼 영역 (하단 고정) */}
      <footer className="flex-shrink-0 px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
          >
            뒤로
          </button>
          <button
            form="create-class-schedule-form"
            type="submit"
            disabled={!isValid}
            className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </footer>

      {/* 시간 선택 Slide Up Modal */}
      <SlideUpModal
        isOpen={showTimePicker !== null}
        onClose={() => setShowTimePicker(null)}
        title={showTimePicker === 'start' ? '시작 시간 선택' : '종료 시간 선택'}
      >
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
            <TimePicker
              value={showTimePicker === 'start' ? (startTime || '09:00') : (endTime || '10:00')}
              onChange={(time) => {
                if (showTimePicker === 'start') {
                  handleTimeChange('start', time);
                } else {
                  handleTimeChange('end', time);
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
                ? (watchedStartDate || new Date().toISOString().split('T')[0])
                : (watchedEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
              }
              onChange={(date) => {
                if (showDatePicker === 'start') {
                  setValue('startDate', date, { shouldValidate: true });
                  trigger('startDate');
                  trigger('endDate'); // endDate refine 검증도 트리거
                } else {
                  setValue('endDate', date, { shouldValidate: true });
                  trigger('endDate');
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