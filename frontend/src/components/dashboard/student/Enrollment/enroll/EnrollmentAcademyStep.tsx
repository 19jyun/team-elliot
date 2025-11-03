'use client';

import React from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { useStudentApi } from '@/hooks/student/useStudentApi';

export function EnrollmentAcademyStep() {
  const { goBack, setSelectedAcademyId: setContextSelectedAcademyId, setEnrollmentStep } = useApp();
  const { status } = useSession()

  // API에서 academies 데이터 가져오기
  const { academies, isLoading, error, loadAcademies, clearErrors } = useStudentApi();

  const [localSelectedAcademyId, setLocalSelectedAcademyId] = React.useState<number | null>(null);

  // 컴포넌트 마운트 시 학원 목록 로드
  React.useEffect(() => {
    loadAcademies();
  }, [loadAcademies]);

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isActive: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '클래스 선택',
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
      isCompleted: false,
    },
  ];

  const handleAcademySelect = (academyId: number) => {
    // 하나만 선택 가능하도록 수정
    setLocalSelectedAcademyId(academyId);
  };

  const handleNextStep = () => {
    if (!localSelectedAcademyId) {
      toast.error('학원을 선택해주세요.');
      return;
    }
    
    setContextSelectedAcademyId(localSelectedAcademyId);
    setEnrollmentStep('class-selection');
  };

  // 에러 처리 - AcademyManagement와 동일한 패턴 적용
  if (error && academies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">학원 정보를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => {
            clearErrors();
            loadAcademies();
          }}
          className="mt-4 px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
        <div className="flex gap-6 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[320px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-1 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          수강신청할 학원을 선택해주세요.
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {academies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">가입된 학원이 없습니다.</p>
              <button
                onClick={goBack}
                className="px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
              >
                뒤로가기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {academies.map((academy) => (
                <div
                  key={academy.id}
                  onClick={() => handleAcademySelect(academy.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    localSelectedAcademyId === academy.id
                      ? 'border-[#AC9592] bg-[#AC9592]/10'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{academy.name}</h3>
                      <p className="text-sm text-gray-600">{academy.address}</p>
                    </div>
                    {localSelectedAcademyId === academy.id && (
                      <div className="w-6 h-6 bg-[#AC9592] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            onClick={handleNextStep}
            disabled={!localSelectedAcademyId}
            className="flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center bg-[#AC9592] text-white cursor-pointer hover:bg-[#9A8582] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </footer>
    </div>
  );
} 