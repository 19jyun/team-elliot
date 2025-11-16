'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StatusStep } from './StatusStep';
import { useCreatePrincipalClass } from '@/hooks/mutations/principal/useCreatePrincipalClass';
import { toast } from 'sonner';

export function CreateClassStepDetail() {
  const { form, setClassFormData, setCreateClassStep } = useApp();
  const { createClass } = form;
  const { classFormData, selectedTeacherId } = createClass;

  // React Query 기반 데이터 관리
  const createClassMutation = useCreatePrincipalClass();

  const isSubmitting = createClassMutation.isPending;

  const [content, setContent] = useState(classFormData.content);

  // 필수 필드 검증 함수
  const isFormValid = () => {
    return content.trim() !== '';
  };

  const handleNext = async () => {
    // 강의 내용 검증
    if (!content.trim()) {
      toast.error('강의 내용을 입력해주세요.');
      return;
    }

    // DashboardContext의 createClass 상태 업데이트
    const updatedClassFormData = {
      ...classFormData,
      content: content,
    };
    setClassFormData(updatedClassFormData);

    // 필수 필드 검증
    if (!updatedClassFormData.schedule.startDate || !updatedClassFormData.schedule.endDate) {
      toast.error('강의 기간을 설정해주세요.');
      return;
    }

    // 선택된 선생님 ID 확인
    if (!selectedTeacherId) {
      toast.error('선생님을 선택해주세요.');
      return;
    }

    // API 요청 데이터 구성
    const requestData = {
      className: updatedClassFormData.name,
      description: updatedClassFormData.description,
      maxStudents: updatedClassFormData.maxStudents,
      tuitionFee: updatedClassFormData.price,
      teacherId: selectedTeacherId, // 선택된 선생님의 ID
      dayOfWeek: updatedClassFormData.schedule.days[0],
      level: updatedClassFormData.level,
      startDate: updatedClassFormData.schedule.startDate,
      endDate: updatedClassFormData.schedule.endDate,
      startTime: updatedClassFormData.schedule.startTime,
      endTime: updatedClassFormData.schedule.endTime,
      backgroundColor: "#F8F9FA", // 기본값
    };

    
    // 실제 API 호출 (Principal 전용)
    createClassMutation.mutate(requestData, {
      onSuccess: () => {
        // complete 단계로 이동
        setCreateClassStep('complete');
      },
      onError: () => {
        toast.error('강의 생성에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const handleBack = () => {
    setCreateClassStep('schedule');
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
        <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
          <div className="space-y-4">
            {/* 강의 내용 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                강의 내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
                rows={8}
                placeholder="강의에서 다룰 내용을 상세히 작성해주세요.&#10;&#10;예시:&#10;- 발레 기본 자세 연습&#10;- 스트레칭 및 워밍업&#10;- 기본 스텝 연습&#10;- 음악에 맞춘 동작 연습"
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
                  <span className="font-medium">
                    {classFormData.schedule.days.map(day => {
                      const dayMap: { [key: string]: string } = {
                        'MONDAY': '월', 'TUESDAY': '화', 'WEDNESDAY': '수',
                        'THURSDAY': '목', 'FRIDAY': '금', 'SATURDAY': '토', 'SUNDAY': '일'
                      };
                      return dayMap[day] || day;
                    }).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">시간:</span>
                  <span className="font-medium">
                    {classFormData.schedule.startTime} ~ {classFormData.schedule.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">기간:</span>
                  <span className="font-medium">
                    {classFormData.schedule.startDate} ~ {classFormData.schedule.endDate}
                  </span>
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
              disabled={isSubmitting || !isFormValid()}
              className="flex-1 px-4 py-3 text-white bg-[#AC9592] rounded-lg hover:bg-[#9A8582] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '생성 중...' : '강의 생성'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 