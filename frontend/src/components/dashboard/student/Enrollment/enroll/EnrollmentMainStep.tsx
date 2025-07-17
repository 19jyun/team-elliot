'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

export function NewEnrollmentMainStep() {
  const router = useRouter();
  const { setEnrollmentStep, navigateToSubPage } = useDashboardNavigation();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const handleEnrollmentClick = () => {
    // 새로운 수강신청 플로우 시작
    setEnrollmentStep('academy-selection');
    navigateToSubPage('new-enroll');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 w-full bg-white">
      {/* 수강신청 카드 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        <div 
          onClick={handleEnrollmentClick}
          className="flex flex-col justify-center items-center px-6 py-8 w-full bg-white rounded-2xl border-2 border-dashed border-[#AC9592] cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-16 h-16 bg-[#AC9592] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#573B30] mb-2">수강신청</h2>
          <p className="text-sm text-[#595959] leading-relaxed">
            원하는 클래스를 선택하고<br />
            수강할 세션을 신청하세요
          </p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="flex gap-2 items-center self-center mt-6 w-full max-w-[327px]">
        <div className="flex-1 h-[1px] bg-stone-200" />
        <div className="flex-1 h-[1px] bg-stone-200" />
      </div>

      {/* 공지사항 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full text-center max-w-[335px]">
        <div className="text-lg font-semibold leading-tight text-stone-700 mb-4">
          공지사항
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-[#573B30] mb-2">수강신청 안내</h3>
          <ul className="text-sm text-[#595959] space-y-1">
            <li>• 원하는 클래스를 선택해주세요</li>
            <li>• 입금 확인 후 수강신청이 최종 승인됩니다</li>
            <li>• 문의사항은 학원에 직접 연락해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 