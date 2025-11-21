'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext'; // resetEnrollmentModification 포함
import { CompleteIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { ensureTrailingSlash } from '@/lib/utils/router';

interface ModificationCompleteStepProps {
  // 어떤 완료 상태인지 명시
  type: 'refund' | 'payment' | 'default'; 
}

export function ModificationCompleteStep({ type }: ModificationCompleteStepProps) {
  // 1. 수강 변경 전용 초기화 함수 가져오기
  const { resetEnrollmentModification } = useApp();
  const router = useRouter();

  // 2. 마운트 시점에 스토리지 정리 (선택 사항)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/storage/StorageAdapter').then(({ SyncStorage }) => {
        SyncStorage.removeItem('refundPolicyAgreement');
      });
    }
  }, []);

  const handleConfirm = () => {
    // 3. 수강 변경 상태 초기화
    resetEnrollmentModification();
    
    // 4. 목록 페이지로 이동
    router.push(ensureTrailingSlash('/dashboard/student/class'));
  };

  // 텍스트 매핑 로직
  const getMessage = () => {
    switch (type) {
      case 'refund':
        return {
          title: '환불 신청이 완료되었어요!',
          desc: <>환불까지<br />최대 48시간이 걸릴 수 있어요.</>
        };
      case 'payment':
        return {
          title: '수강 변경(결제)이 완료되었어요!',
          desc: '승인 대기 중입니다.'
        };
      default:
        return {
          title: '수강 변경이 완료되었어요!',
          desc: '변경된 내용을 확인해보세요.'
        };
    }
  };

  const { title, desc } = getMessage();

  return (
    <div className="flex flex-col h-full bg-white font-[Pretendard Variable]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          {/* 아이콘 */}
          <div className="w-24 h-24 flex items-center justify-center">
            <CompleteIcon className="w-full h-full" />
          </div>

          {/* 메시지 */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-[#573B30]">
              {title}
            </h2>
            <p className="mt-4 text-sm text-[#595959]">
              {desc}
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50 border-t border-gray-200">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full">
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 rounded-lg text-base font-semibold bg-[#AC9592] text-white hover:bg-[#9A8582] transition-colors"
          >
            확인
          </button>
        </div>
      </footer>
    </div>
  );
}