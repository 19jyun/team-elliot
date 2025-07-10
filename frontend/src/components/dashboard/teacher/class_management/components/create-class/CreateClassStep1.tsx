'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

export function CreateClassStep1() {
  const { createClass, setClassFormData, setCreateClassStep, goBack } = useDashboardNavigation();
  const { classFormData } = createClass;
  
  const [formData, setFormData] = useState({
    name: classFormData.name,
    description: classFormData.description,
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
    setClassFormData(formData);
    setCreateClassStep('schedule');
  };

  const handleBack = () => {
    goBack();
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">강의 개설</h1>
        <p className="mt-2 text-stone-500">
          새로운 강의의 기본 정보를 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
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

          {/* 최대 수강생 수 */}
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

          {/* 강의료 */}
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
    </div>
  );
} 