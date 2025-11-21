'use client';

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { StatusStep } from './StatusStep';
import { useApp } from '@/contexts/AppContext';
import { classDetailSchema, ClassDetailSchemaType } from '@/lib/schemas/class-create';
import { useCreatePrincipalClass } from '@/hooks/mutations/principal/useCreatePrincipalClass';
import { toast } from 'sonner';
import { ensureTrailingSlash } from '@/lib/utils/router';

// 요일 숫자를 문자열로 변환 (0: 일요일 ~ 6: 토요일)
const DAY_OF_WEEK_MAP: { [key: number]: string } = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

const DAY_LABEL_MAP: { [key: string]: string } = {
  'MONDAY': '월',
  'TUESDAY': '화',
  'WEDNESDAY': '수',
  'THURSDAY': '목',
  'FRIDAY': '금',
  'SATURDAY': '토',
  'SUNDAY': '일',
};

export function CreateClassStepDetail() {
  const router = useRouter();
  const { form } = useApp();
  const { principalCreateClass } = form;
  const { classFormData, selectedTeacherId } = principalCreateClass;

  // React Query 기반 데이터 관리
  const createClassMutation = useCreatePrincipalClass();
  const isSubmitting = createClassMutation.isPending;

  // React Hook Form 설정
  const { control, handleSubmit, formState: { isValid } } = useForm<ClassDetailSchemaType>({
    resolver: zodResolver(classDetailSchema),
    defaultValues: {
      content: '', // Context에 content 필드가 없으므로 빈 문자열
    },
    mode: 'onChange', // 실시간 검증
    reValidateMode: 'onChange',
  });

  // 요일 레이블 생성 (UI용)
  const dayLabels = useMemo(() => {
    if (!classFormData.schedule || classFormData.schedule.length === 0) {
      return '미설정';
    }
    return classFormData.schedule.map(s => {
      const dayStr = DAY_OF_WEEK_MAP[s.dayOfWeek];
      return DAY_LABEL_MAP[dayStr] || dayStr;
    }).join(', ');
  }, [classFormData.schedule]);

  // 시간 표시 (UI용)
  const timeLabel = useMemo(() => {
    if (!classFormData.schedule || classFormData.schedule.length === 0) {
      return '미설정';
    }
    const firstSchedule = classFormData.schedule[0];
    return `${firstSchedule.startTime} ~ ${firstSchedule.endTime}`;
  }, [classFormData.schedule]);

  const onNext = async (data: ClassDetailSchemaType) => {
    // 필수 필드 검증
    if (!classFormData.startDate || !classFormData.endDate) {
      toast.error('강의 기간을 설정해주세요.');
      return;
    }

    if (!selectedTeacherId) {
      toast.error('선생님을 선택해주세요.');
      return;
    }

    if (!classFormData.schedule || classFormData.schedule.length === 0) {
      toast.error('일정을 설정해주세요.');
      return;
    }

    // 첫 번째 일정 항목 사용 (API는 단일 dayOfWeek만 받음)
    const firstSchedule = classFormData.schedule[0];
    const dayOfWeekStr = DAY_OF_WEEK_MAP[firstSchedule.dayOfWeek];

    // API 요청 데이터 구성
    const requestData = {
      className: classFormData.name,
      description: classFormData.description,
      maxStudents: classFormData.maxStudents,
      tuitionFee: classFormData.price,
      teacherId: selectedTeacherId,
      dayOfWeek: dayOfWeekStr,
      level: classFormData.level,
      startDate: classFormData.startDate,
      endDate: classFormData.endDate,
      startTime: firstSchedule.startTime,
      endTime: firstSchedule.endTime,
      backgroundColor: "#F8F9FA", // 기본값
    };

    // 실제 API 호출 (Principal 전용)
    createClassMutation.mutate(requestData, {
      onSuccess: () => {
        // complete 단계로 이동
        router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info/teacher/schedule/content/complete'));
      },
      onError: () => {
        toast.error('강의 생성에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const handleBack = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/class/create-class/info/teacher/schedule'));
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
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '일정 설정',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '강의 내용',
      isActive: true,
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
          강의 내용을 작성해주세요.
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5">
        <form onSubmit={handleSubmit(onNext)} className="flex flex-col h-full">
          <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
            <div className="space-y-4">
              {/* 강의 내용 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의 내용 *
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none ${
                          error ? 'border-red-500' : 'border-stone-300'
                        }`}
                        rows={8}
                        placeholder="강의에서 다룰 내용을 상세히 작성해주세요.&#10;&#10;예시:&#10;- 발레 기본 자세 연습&#10;- 스트레칭 및 워밍업&#10;- 기본 스텝 연습&#10;- 음악에 맞춘 동작 연습"
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-500">{error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* 강의 정보 요약 */}
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의 정보 요약
                </label>
                <div className="p-4 bg-stone-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">강의명:</span>
                    <span className="font-medium">{classFormData.name || '미입력'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">난이도:</span>
                    <span className="font-medium">
                      {classFormData.level === 'BEGINNER' ? '초급' : 
                       classFormData.level === 'INTERMEDIATE' ? '중급' : 
                       classFormData.level === 'ADVANCED' ? '고급' : '미선택'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">최대 수강생:</span>
                    <span className="font-medium">{classFormData.maxStudents}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">강의료:</span>
                    <span className="font-medium">{classFormData.price?.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">요일:</span>
                    <span className="font-medium">{dayLabels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">시간:</span>
                    <span className="font-medium">{timeLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">기간:</span>
                    <span className="font-medium">
                      {classFormData.startDate ? new Date(classFormData.startDate).toLocaleDateString('ko-KR') : '미설정'} ~ {classFormData.endDate ? new Date(classFormData.endDate).toLocaleDateString('ko-KR') : '미설정'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
              >
                뒤로
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '생성 중...' : '강의 생성'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
} 