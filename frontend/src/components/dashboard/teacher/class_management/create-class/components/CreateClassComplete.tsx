'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from './StatusStep';

export function CreateClassComplete() {
  const { createClass, goBack, resetCreateClass } = useDashboardNavigation();
  const { classFormData } = createClass;

  const handleFinish = () => {
    // 상태 초기화 후 메인으로 돌아가기
    resetCreateClass();
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
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '일정 설정',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '강의 내용',
      isActive: false,
      isCompleted: true,
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
          강의 개설이 완료되었어요!
        </div>
      </header>

      {/* 완료 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          {/* 완료 아이콘 */}
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/icons/complete.svg" alt="완료" className="w-full h-full" />
          </div>

          {/* 완료 메시지 */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#573B30' }}>
              강의 개설이 완료되었어요!
            </h2>
            <p className="leading-relaxed" style={{ color: '#595959' }}>
              강의 정보가 성공적으로 등록되었습니다.<br />
              수강생들이 강의를 신청할 수 있어요
            </p>
          </div>

          {/* 강의 정보 요약 */}
          <div className="w-full bg-stone-50 p-4 rounded-lg">
            <h3 className="font-semibold text-stone-700 mb-3 text-center">강의 정보</h3>
            <div className="space-y-2 text-sm text-left">
              <div>
                <span className="font-medium text-stone-600">강의명:</span>
                <span className="ml-2 text-stone-800">{classFormData.name}</span>
              </div>
              <div>
                <span className="font-medium text-stone-600">난이도:</span>
                <span className="ml-2 text-stone-800">
                  {classFormData.level === 'BEGINNER' ? '초급' : 
                   classFormData.level === 'INTERMEDIATE' ? '중급' : '고급'}
                </span>
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
                <span className="ml-2 text-stone-800">
                  {classFormData.schedule.days[0] === 'MONDAY' ? '월요일' :
                   classFormData.schedule.days[0] === 'TUESDAY' ? '화요일' :
                   classFormData.schedule.days[0] === 'WEDNESDAY' ? '수요일' :
                   classFormData.schedule.days[0] === 'THURSDAY' ? '목요일' :
                   classFormData.schedule.days[0] === 'FRIDAY' ? '금요일' :
                   classFormData.schedule.days[0] === 'SATURDAY' ? '토요일' : '일요일'}
                </span>
              </div>
              <div>
                <span className="font-medium text-stone-600">강의 시간:</span>
                <span className="ml-2 text-stone-800">
                  {classFormData.schedule.startTime} ~ {classFormData.schedule.endTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            onClick={handleFinish}
            className="flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center bg-[#AC9592] text-white cursor-pointer hover:bg-[#9A8582]"
          >
            확인
          </button>
        </div>
      </footer>
    </div>
  );
} 