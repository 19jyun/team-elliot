'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

export function CreateClassStep3() {
  const { createClass, setClassFormData, setCreateClassStep } = useDashboardNavigation();
  const { classFormData } = createClass;
  
  const [content, setContent] = useState(classFormData.content);

  const handleNext = () => {
    setClassFormData({
      ...classFormData,
      content,
    });
    setCreateClassStep('complete');
  };

  const handleBack = () => {
    setCreateClassStep('schedule');
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">강의 내용</h1>
        <p className="mt-2 text-stone-500">
          강의에서 다룰 내용을 상세히 작성해주세요.
        </p>
      </div>

      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
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

          {/* 미리보기 */}
          {content && (
            <div className="text-left">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                미리보기
              </label>
              <div className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-stone-50 min-h-[100px] whitespace-pre-wrap text-sm">
                {content}
              </div>
            </div>
          )}
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
            disabled={!content.trim()}
            className="flex-1 px-4 py-3 text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
} 