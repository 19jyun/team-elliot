'use client'
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { CompleteIcon } from '@/components/icons';

export function EnrollmentCompleteStep() {
  const { navigation, resetEnrollment, clearHistory } = useApp();
  const { clearSubPage } = navigation;

  const handleConfirm = async () => {
    // localStorage에서 모든 enrollment 관련 데이터 삭제
    if (typeof window !== 'undefined') {
      const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
      // 새로운 enrollment 관련 데이터
      SyncStorage.removeItem('selectedSessions');
      SyncStorage.removeItem('selectedClassCards');
      SyncStorage.removeItem('selectedClasses');
      SyncStorage.removeItem('existingEnrollments');
      
      // 새로운 수강신청 관련 데이터
      SyncStorage.removeItem('selectedAcademyId');
      SyncStorage.removeItem('selectedClassIds');
      
      // 기존 enrollment 관련 데이터들
      SyncStorage.removeItem('modificationChangeAmount');
      SyncStorage.removeItem('modificationChangeType');
      SyncStorage.removeItem('modificationNetChangeCount');
      SyncStorage.removeItem('modificationNewSessionsCount');
      SyncStorage.removeItem('refundPolicyAgreed');
      SyncStorage.removeItem('enrollmentStep');
      SyncStorage.removeItem('selectedMonth');
    }
    
    // 수강신청 상태 초기화
    resetEnrollment();
    
    // Virtual History 초기화
    clearHistory();
    
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
            <CompleteIcon className="w-full h-full" />
          </div>

          {/* 완료 메시지 */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#573B30' }}>
              수강신청이 완료되었어요!
            </h2>
            <p className="leading-relaxed" style={{ color: '#595959' }}>
              입금 내역이 확인되면,<br />
              수강신청이 최종 승인되어요
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