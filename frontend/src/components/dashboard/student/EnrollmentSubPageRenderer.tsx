'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface EnrollmentSubPageRendererProps {
  page: string;
}

export function EnrollmentSubPageRenderer({ page }: EnrollmentSubPageRendererProps) {
  const { goBack } = useDashboardNavigation();

  // 페이지 파싱 (예: "enroll-8" -> month: 8)
  const month = page.replace('enroll-', '');

  // 임시로 간단한 컴포넌트 렌더링
  // 나중에 실제 월별 수강신청 페이지 컴포넌트로 교체
  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>
        <h1 className="text-lg font-semibold">{month}월 수강신청</h1>
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-center text-gray-500">
          {month}월 수강신청 페이지가 여기에 렌더링됩니다.
        </div>
      </div>
    </div>
  );
} 