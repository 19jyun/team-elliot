'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { CompleteIcon } from '@/components/icons';

interface RefundCompleteStepProps {
  refundAmount: number;
  cancelledSessionsCount: number;
  isModification?: boolean;
}

export function RefundCompleteStep({ isModification }: RefundCompleteStepProps) {
  const { navigation, resetEnrollment } = useApp();
  const { clearSubPage } = navigation;

  const handleConfirm = async () => {
    // Context 기반으로 변경되었으므로 localStorage 정리는 최소화
    // (다른 플로우에서 사용할 수 있는 데이터는 유지)
    if (typeof window !== 'undefined') {
      const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
      // 수강 변경 플로우에서만 사용하던 데이터만 정리
      SyncStorage.removeItem('refundPolicyAgreement');
    }
    
    // 수강신청 상태 초기화 (일반 enrollment)
    resetEnrollment();
    
    // ❌ 제거: clearHistory() - Virtual History 관리는 clearSubPage에서 처리됨
    // clearSubPage()가 GoBackManager.closeSubPage()를 호출하여
    // Virtual History에서 현재 subpage 엔트리만 제거합니다.
    // 전체 히스토리를 초기화하지 않아 다른 서브페이지 히스토리가 유지됩니다.
    
    // enrollment 컨테이너(subpage) 완전히 닫기
    // GoBackManager가 Virtual History에서 현재 subpage만 pop합니다.
    await clearSubPage();
  };

  return (
    <div className="flex flex-col bg-white font-[Pretendard Variable]">
      {/* 완료 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          {/* 완료 아이콘 */}
          <div className="w-24 h-24 flex items-center justify-center">
            <CompleteIcon className="w-full h-full" />
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