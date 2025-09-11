'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts';
import { StatusStep } from './StatusStep';

import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { toast } from 'sonner';

const LEVELS = [
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
];

export function CreateClassStepInfo() {
  const { form, goBack } = useApp();
  const { createClass, setClassFormData, setCreateClassStep } = form;
  const { classFormData } = createClass;
  
  // API 기반 데이터 관리
  const { academy, loadAcademy, isLoading: isAcademyLoading } = usePrincipalApi();


  const [formData, setFormData] = useState({
    name: classFormData.name,
    description: classFormData.description,
    level: classFormData.level || 'BEGINNER',
    maxStudents: classFormData.maxStudents,
    price: classFormData.price || 50000,
  });

  // 학원 정보 로드
  React.useEffect(() => {
    loadAcademy();
  }, [loadAcademy]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 필수 필드 검증 함수
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.maxStudents >= 1 &&
      formData.price >= 0 &&
      !!academy
    );
  };

  const handleNext = () => {
    // 필수 필드 검증
    if (!formData.name.trim()) {
      toast.error('강의명을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('강의 설명을 입력해주세요.');
      return;
    }
    if (formData.maxStudents < 1) {
      toast.error('최대 수강생 수는 1명 이상이어야 합니다.');
      return;
    }
    if (formData.price < 0) {
      toast.error('강의료는 0원 이상이어야 합니다.');
      return;
    }

    // 학원 가입 여부 확인
    if (!academy) {
      toast.error('학원을 먼저 가입해주세요!');
      return;
    }

    // DashboardContext의 createClass 상태 업데이트
    const academyId = academy.id;
    setClassFormData({
      ...classFormData,
      name: formData.name,
      description: formData.description,
      level: formData.level,
      maxStudents: formData.maxStudents,
      price: formData.price,
      academyId,
    });
    setCreateClassStep('teacher');
  };

  const handleBack = () => {
    goBack();
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

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5 ">
        <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px] mx-auto">
          <div className="space-y-4">
            {/* 강의명 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                강의명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder="강의명을 입력하세요"
              />
            </div>

            {/* 강의 설명 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                강의 설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="강의에 대한 설명을 입력하세요"
              />
            </div>

            {/* 난이도 선택 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                난이도 *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleInputChange('level', level.value)}
                    className={`px-4 py-3 text-sm border rounded-lg transition-colors ${
                      formData.level === level.value
                        ? 'bg-[#AC9592] text-white border-[#AC9592]'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 최대 수강생 수와 강의료 (같은 줄) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  최대 수강생 수 *
                </label>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleInputChange('maxStudents', Math.max(1, formData.maxStudents - 1))}
                    className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 1)}
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
                    onClick={() => handleInputChange('maxStudents', Math.min(50, formData.maxStudents + 1))}
                    className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의료 (원) *
                </label>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleInputChange('price', Math.max(0, formData.price - 1000))}
                    className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleInputChange('price', value);
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
                    onClick={() => handleInputChange('price', formData.price + 1000)}
                    className="w-8 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    +
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
    </div>
  );
} 