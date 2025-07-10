'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from './StatusStep';
import { toast } from 'sonner';

const LEVELS = [
  { value: 'BEGINNER', label: '초급' },
  { value: 'INTERMEDIATE', label: '중급' },
  { value: 'ADVANCED', label: '고급' },
];

export function CreateClassStep1() {
  const { createClass, setClassFormData, setCreateClassStep, goBack } = useDashboardNavigation();
  const { classFormData } = createClass;
  
  const [formData, setFormData] = useState({
    name: classFormData.name,
    description: classFormData.description,
    level: classFormData.level || 'BEGINNER',
    maxStudents: classFormData.maxStudents,
    price: classFormData.price,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    // academyId 체크 (임시로 1로 설정, 실제로는 사용자 정보에서 가져와야 함)
    const academyId = 1; // TODO: 실제 사용자의 academyId를 가져오는 로직 필요
    
    if (!academyId) {
      toast.error('학원 등록을 먼저 해주세요.');
      return;
    }

    setClassFormData({
      ...formData,
      academyId,
    });
    setCreateClassStep('schedule');
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
                        ? 'bg-stone-700 text-white border-stone-700'
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
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  min="1"
                  max="50"
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  강의료 (원) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  min="0"
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
              disabled={!formData.name || !formData.description || formData.maxStudents <= 0}
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