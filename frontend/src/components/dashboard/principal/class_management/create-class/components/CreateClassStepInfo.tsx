'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { StatusStep } from './StatusStep';
import { usePrincipalAcademy } from '@/hooks/queries/principal/usePrincipalAcademy';
import { useApp } from '@/contexts/AppContext';
import { classInfoSchema, ClassInfoSchemaType } from '@/lib/schemas/class-create';
import { toast } from 'sonner';
import { ensureTrailingSlash } from '@/lib/utils/router';

const LEVELS = [
  { value: 'BEGINNER' as const, label: '초급' },
  { value: 'INTERMEDIATE' as const, label: '중급' },
  { value: 'ADVANCED' as const, label: '고급' },
];

export function CreateClassStepInfo() {
  const router = useRouter();
  const { form, setPrincipalClassFormData } = useApp();
  const { principalCreateClass } = form;
  const { classFormData } = principalCreateClass;
  
  // React Query 기반 데이터 관리
  const { data: academy, isLoading: isAcademyLoading } = usePrincipalAcademy();

  // React Hook Form 설정
  const { control, handleSubmit, formState: { isValid }, setValue, watch, trigger } = useForm<ClassInfoSchemaType>({
    resolver: zodResolver(classInfoSchema),
    defaultValues: {
      name: classFormData.name || '',
      description: classFormData.description || '',
      level: classFormData.level || 'BEGINNER',
      maxStudents: classFormData.maxStudents || 1,
      price: classFormData.price || 50000,
    },
    mode: 'onChange', // 실시간 검증
    reValidateMode: 'onChange',
  });

  const watchedLevel = watch('level');
  const watchedMaxStudents = watch('maxStudents');
  const watchedPrice = watch('price');

  const onNext = (data: ClassInfoSchemaType) => {
    // 학원 가입 여부 확인
    if (!academy) {
      toast.error('학원을 먼저 가입해주세요!');
      return;
    }

    // Context 업데이트
    setPrincipalClassFormData({
      ...classFormData,
      ...data,
    });
    
    // 다음 단계로 이동
    router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info/teacher'));
  };

  const handleBack = () => {
    router.back();
  };

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '기본 정보',
      isActive: true,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '선생님 지정',
      isActive: false,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일정 설정',
      isActive: false,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '강의 내용',
      isActive: false,
      isCompleted: false,
    },
  ];

  if (isAcademyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

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
          강의의 기본 정보를 입력해주세요.
        </div>
      </header>

      {/* 메인 콘텐츠 - 고정 높이 + 스크롤 */}
      <main className="flex-shrink-0 overflow-y-auto px-5" style={{ height: 'calc(100vh - 390px)' }}>
        <form id="create-class-info-form" onSubmit={handleSubmit(onNext)} className="flex flex-col">
          <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto pb-4">
            <div className="space-y-4">
              {/* 강의명 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의명 *
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent ${
                          error ? 'border-red-500' : 'border-stone-300'
                        }`}
                        placeholder="강의명을 입력하세요"
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-500">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* 강의 설명 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의 설명 *
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none ${
                          error ? 'border-red-500' : 'border-stone-300'
                        }`}
                        rows={4}
                        placeholder="강의에 대한 설명을 입력하세요"
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-500">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* 난이도 선택 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  난이도 *
                </label>
                <Controller
                  name="level"
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {LEVELS.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => {
                              setValue('level', level.value, { shouldValidate: true });
                              trigger('level');
                            }}
                            className={`px-4 py-3 text-sm border rounded-lg transition-colors ${
                              watchedLevel === level.value
                                ? 'bg-[#AC9592] text-white border-[#AC9592]'
                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      {error && (
                        <p className="mt-1 text-sm text-red-500">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* 최대 수강생 수와 강의료 (같은 줄) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-left">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    최대 수강생 수 *
                  </label>
                  <Controller
                    name="maxStudents"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <div className={`flex items-center border rounded-lg ${
                          error ? 'border-red-500' : 'border-stone-300'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(1, watchedMaxStudents - 1);
                              setValue('maxStudents', newValue, { shouldValidate: true });
                              trigger('maxStudents');
                            }}
                            className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                          >
                            -
                          </button>
                          <input
                            {...field}
                            type="number"
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setValue('maxStudents', value, { shouldValidate: true });
                              trigger('maxStudents');
                            }}
                            className="flex-1 px-3 py-3 text-center border-none focus:outline-none"
                            min="1"
                            max="50"
                            style={{ 
                              height: '48px', 
                              width: 'calc(100% - 64px)',
                              WebkitAppearance: 'none',
                              MozAppearance: 'textfield'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Math.min(50, watchedMaxStudents + 1);
                              setValue('maxStudents', newValue, { shouldValidate: true });
                              trigger('maxStudents');
                            }}
                            className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {error && (
                          <p className="mt-1 text-sm text-red-500">{error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="text-left">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    강의료 (원) *
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <div className={`flex items-center border rounded-lg ${
                          error ? 'border-red-500' : 'border-stone-300'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(0, watchedPrice - 1000);
                              setValue('price', newValue, { shouldValidate: true });
                              trigger('price');
                            }}
                            className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                          >
                            -
                          </button>
                          <input
                            {...field}
                            type="number"
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setValue('price', value, { shouldValidate: true });
                              trigger('price');
                            }}
                            className="flex-1 px-3 py-3 text-center border-none focus:outline-none"
                            min="0"
                            step="1000"
                            style={{ 
                              height: '48px', 
                              width: 'calc(100% - 64px)',
                              WebkitAppearance: 'none',
                              MozAppearance: 'textfield'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = watchedPrice + 1000;
                              setValue('price', newValue, { shouldValidate: true });
                              trigger('price');
                            }}
                            className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {error && (
                          <p className="mt-1 text-sm text-red-500">{error.message}</p>
                        )}
                      </>
                    )}
                  />
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
            form="create-class-info-form"
            type="submit"
            disabled={!isValid || !academy}
            className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </footer>
    </div>
  );
} 