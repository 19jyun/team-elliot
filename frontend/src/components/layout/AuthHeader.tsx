'use client';

import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export function AuthHeader() {
  const { navigation, goBack, setAuthMode } = useApp();
  const { subPage } = navigation;

  const handleBackClick = async () => {
    try {
      // Dashboard의 통합된 goBack 시스템 사용
      const success = await goBack();
      
      // goBack이 실패했거나, signup-roles에서 뒤로가기한 경우 로그인 페이지로
      if (!success || subPage === 'signup-roles') {
        setAuthMode('login');
      }
    } catch (error) {
      console.error('GoBack error:', error);
      // 오류 발생 시 로그인 페이지로
      setAuthMode('login');
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 flex-shrink-0 pt-safe">
      {/* 로고 섹션 */}
      <div className="flex items-center justify-between px-2.5 py-4 w-full min-h-[60px]">
        {/* 뒤로가기 버튼 (SubPage일 때만 표시) */}
        {subPage ? (
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-8 h-8"></div>
        )}
        
        {/* 로고 */}
        <div className="flex gap-2.5 justify-center items-center">
          <Image
            src="/images/logo/team-eliot-3.png"
            alt="Team Eliot Logo"
            width={77}
            height={46}
            className="object-contain"
            priority
          />
        </div>
        
        {/* 우측 여백 (좌우 균형을 위해) */}
        <div className="w-8 h-8"></div>
      </div>
    </div>
  );
} 