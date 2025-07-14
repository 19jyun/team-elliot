'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface RefundCompleteStepProps {
  refundAmount: number;
  cancelledSessionsCount: number;
  isModification?: boolean;
}

export function RefundCompleteStep({ refundAmount, cancelledSessionsCount, isModification }: RefundCompleteStepProps) {
  const { resetEnrollment, clearSubPage } = useDashboardNavigation();

  const handleConfirm = () => {
    // localStorage에서 모든 enrollment 관련 데이터 삭제
    if (typeof window !== 'undefined') {
      // 기본 enrollment 관련 데이터
      localStorage.removeItem('selectedSessions');
      localStorage.removeItem('selectedClassCards');
      localStorage.removeItem('selectedClasses');
      localStorage.removeItem('existingEnrollments');
      
      // 수강 변경 관련 데이터
      localStorage.removeItem('modificationChangeAmount');
      localStorage.removeItem('modificationChangeType');
      localStorage.removeItem('modificationNetChangeCount');
      localStorage.removeItem('modificationNewSessionsCount');
      
      // 환불 정책 동의 상태
      localStorage.removeItem('refundPolicyAgreed');
      
      // 기타 enrollment 관련 데이터들
      localStorage.removeItem('enrollmentStep');
      localStorage.removeItem('selectedMonth');
      localStorage.removeItem('selectedAcademyId');
      localStorage.removeItem('selectedClassIds');
    }
    
    // 수강신청 상태 초기화
    resetEnrollment();
    
    // enrollment 컨테이너(subpage) 완전히 닫기
    clearSubPage();
  };

  return (
    <div className="flex flex-col bg-white font-[Pretendard Variable]">
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
              {isModification ? '수강 변경' : '환불'}이 완료되었어요!
            </h2>
            <p className="mt-4 text-sm text-[#595959]">
              {isModification ? '수강 변경' : '환불'}까지<br />
              최대 48시간이 걸릴 수 있어요.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            onClick={handleConfirm}
            className="flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center bg-[#AC9592] text-white cursor-pointer hover:bg-[#9A8582]"
          >
            확인
          </button>
        </div>
      </footer>
    </div>
  );
} 