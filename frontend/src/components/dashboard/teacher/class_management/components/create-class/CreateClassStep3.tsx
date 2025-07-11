'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from './StatusStep';
import { createTeacherClass } from '@/api/class';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export function CreateClassStep3() {
  const { createClass, setClassFormData, setCreateClassStep } = useDashboardNavigation();
  const { classFormData } = createClass;
  const { data: session } = useSession();
  
  const [content, setContent] = useState(classFormData.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    // 강의 내용 업데이트
    const updatedClassFormData = {
      ...classFormData,
      content,
    };
    
    setClassFormData(updatedClassFormData);

    // 필수 필드 검증
    if (!updatedClassFormData.schedule.startDate || !updatedClassFormData.schedule.endDate) {
      toast.error('강의 기간을 설정해주세요.');
      return;
    }

    // 현재 로그인한 선생님의 ID 확인
    if (!session?.user?.id) {
      toast.error('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    // API 요청 데이터 구성
    const requestData = {
      className: updatedClassFormData.name,
      description: updatedClassFormData.description,
      maxStudents: updatedClassFormData.maxStudents,
      tuitionFee: updatedClassFormData.price,
      teacherId: Number(session.user.id), // 현재 로그인한 선생님의 ID
      academyId: updatedClassFormData.academyId!, // 이미 학원 가입 여부를 확인했으므로 non-null assertion 사용
      dayOfWeek: updatedClassFormData.schedule.days[0],
      level: updatedClassFormData.level,
      startDate: updatedClassFormData.schedule.startDate,
      endDate: updatedClassFormData.schedule.endDate,
      startTime: updatedClassFormData.schedule.startTime,
      endTime: updatedClassFormData.schedule.endTime,
      backgroundColor: "#F8F9FA", // 기본값
    };

    // API 요청 데이터를 console.log로 출력
    console.log('강의 생성 API 요청 데이터:', requestData);
    
    try {
      setIsSubmitting(true);
      
      // 실제 API 호출
      const response = await createTeacherClass(requestData);
      console.log('강의 생성 성공:', response);
      
      toast.success('강의가 성공적으로 생성되었습니다!');
      
      // complete 단계로 이동
      setCreateClassStep('complete');
    } catch (error) {
      console.error('강의 생성 실패:', error);
      toast.error('강의 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
                placeholder="강의에서 다룰 내용을 상세히 작성해주세요.&#10;&#10;예시:&#10;- 강의 목표&#10;- 주요 학습 내용&#10;- 수업 방식&#10;- 준비물&#10;- 기타 안내사항"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              뒤로
            </button>
            <button
              onClick={handleNext}
              disabled={!content.trim() || isSubmitting}
              className="flex-1 px-4 py-3 text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '생성 중...' : '완료'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 