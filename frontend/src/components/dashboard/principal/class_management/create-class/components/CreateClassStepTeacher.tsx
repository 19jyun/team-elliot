'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { StatusStep } from './StatusStep';
import { useApp } from '@/contexts/AppContext';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { getImageUrl } from '@/utils/imageUtils';
import Image from 'next/image';

interface Teacher {
  id: number;
  name: string;
  phoneNumber?: string;
  introduction?: string;
  photoUrl?: string;
}

export function CreateClassStepTeacher() {
  const { form, goBack } = useApp();
  const { createClass } = form;
  const { setCurrentStep, setSelectedTeacherId, selectedTeacherId } = createClass;
  
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(selectedTeacherId);

  // Principal API 훅 사용
  const { teachers, loadTeachers, isLoading, error } = usePrincipalApi();

  // 컴포넌트 마운트 시 선생님 데이터 로드
  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacher(teacherId);
  };

  // 필수 필드 검증 함수
  const isFormValid = () => {
    return !!selectedTeacher;
  };

  const handleNext = () => {
    if (!selectedTeacher) {
      toast.error('선생님을 선택해주세요.');
      return;
    }

    // DashboardContext의 selectedTeacherId 업데이트
    setSelectedTeacherId(selectedTeacher);
    
    setCurrentStep('schedule');
  };

  const handleBack = () => {
    goBack();
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
      label: '선생님 지정',
      isActive: true,
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
          <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
            {statusSteps.map((step, index) => (
              <StatusStep key={index} {...step} />
            ))}
          </div>
          <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
            선생님을 선택해주세요.
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
          <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
            {statusSteps.map((step, index) => (
              <StatusStep key={index} {...step} />
            ))}
          </div>
          <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
            선생님을 선택해주세요.
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">선생님 목록을 불러오는데 실패했습니다.</p>
            <button
              onClick={() => loadTeachers()}
              className="px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          선생님을 선택해주세요.
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5">
        <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
          <div className="space-y-4">
            {/* 선생님 목록 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-3">
                선생님 선택 *
              </label>
              <div className="space-y-3">
                {teachers?.map((teacher: Teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => handleTeacherSelect(teacher.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeacher === teacher.id
                        ? 'border-[#AC9592] bg-[#F8F6F6]'
                        : 'border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 선생님 프로필 이미지 */}
                      <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                        {teacher.photoUrl ? (
                          <Image
                            src={getImageUrl(teacher.photoUrl) || ''}
                            alt={teacher.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-6 h-6 text-stone-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      
                      {/* 선생님 정보 */}
                      <div className="flex-1">
                        <h3 className="font-medium text-stone-800">{teacher.name}</h3>
                        {teacher.phoneNumber && (
                          <p className="text-sm text-stone-600">{teacher.phoneNumber}</p>
                        )}
                        {teacher.introduction && (
                          <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                            {teacher.introduction}
                          </p>
                        )}
                      </div>
                      
                      {/* 선택 표시 */}
                      {selectedTeacher === teacher.id && (
                        <div className="w-6 h-6 rounded-full bg-[#AC9592] flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {teachers?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-stone-500">등록된 선생님이 없습니다.</p>
                  <p className="text-sm text-stone-400 mt-1">먼저 선생님을 등록해주세요.</p>
                </div>
              )}
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
    </div>
  );
} 