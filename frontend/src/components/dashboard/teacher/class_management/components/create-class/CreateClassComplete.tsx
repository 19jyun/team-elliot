'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { CheckCircle } from 'lucide-react';

export function CreateClassComplete() {
  const { createClass, goBack, resetCreateClass } = useDashboardNavigation();
  const { classFormData } = createClass;

  const handleFinish = () => {
    // TODO: 실제 강의 생성 API 호출
    console.log('강의 생성 완료:', classFormData);
    
    // 상태 초기화 후 메인으로 돌아가기
    resetCreateClass();
    goBack();
  };

  const formatDays = (days: string[]) => {
    const dayLabels: { [key: string]: string } = {
      monday: '월',
      tuesday: '화',
      wednesday: '수',
      thursday: '목',
      friday: '금',
      saturday: '토',
      sunday: '일',
    };
    return days.map(day => dayLabels[day]).join(', ');
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">강의 개설 완료</h1>
        <p className="mt-2 text-stone-500">
          강의 정보를 확인하고 개설을 완료해주세요.
        </p>
      </div>

      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        {/* 완료 아이콘 */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        {/* 강의 정보 요약 */}
        <div className="space-y-4 mb-8">
          <div className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-semibold text-stone-700 mb-3">강의 정보</h3>
            <div className="space-y-2 text-sm text-left">
              <div>
                <span className="font-medium text-stone-600">강의명:</span>
                <span className="ml-2 text-stone-800">{classFormData.name}</span>
              </div>
              <div>
                <span className="font-medium text-stone-600">강의료:</span>
                <span className="ml-2 text-stone-800">{classFormData.price.toLocaleString()}원</span>
              </div>
              <div>
                <span className="font-medium text-stone-600">최대 수강생:</span>
                <span className="ml-2 text-stone-800">{classFormData.maxStudents}명</span>
              </div>
              <div>
                <span className="font-medium text-stone-600">강의 요일:</span>
                <span className="ml-2 text-stone-800">{formatDays(classFormData.schedule.days)}</span>
              </div>
              <div>
                <span className="font-medium text-stone-600">강의 시간:</span>
                <span className="ml-2 text-stone-800">
                  {classFormData.schedule.startTime} ~ {classFormData.schedule.endTime}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-semibold text-stone-700 mb-3">강의 설명</h3>
            <p className="text-sm text-stone-800 text-left whitespace-pre-wrap">
              {classFormData.description}
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-semibold text-stone-700 mb-3">강의 내용</h3>
            <p className="text-sm text-stone-800 text-left whitespace-pre-wrap">
              {classFormData.content}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={goBack}
            className="flex-1 px-4 py-3 text-stone-700 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
          >
            수정하기
          </button>
          <button
            onClick={handleFinish}
            className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            강의 개설 완료
          </button>
        </div>
      </div>
    </div>
  );
} 