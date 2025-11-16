'use client';

import { useState } from 'react';
import { useWithdrawal } from '@/hooks/auth/useWithdrawal';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { WithdrawalConfirmDialog } from './WithdrawalConfirmDialog';

const cancellationOptions = [
  {
    id: 1,
    text: '더 이상 서비스를 이용하지 않아요',
  },
  {
    id: 2,
    text: '서비스가 불만족스러워요',
  },
  {
    id: 3,
    text: '다른 서비스를 이용하고 싶어요',
  },
  {
    id: 4,
    text: '기타',
  },
];

export function WithdrawalPage() {
  const { withdrawal } = useWithdrawal();
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { goBack } = useApp();

  const handleBack = async () => {
    if (isLoading) return; // 로딩 중에는 뒤로가기 불가
    await goBack();
  };

  const handleReasonSelect = (id: number) => {
    if (isLoading) return; // 로딩 중에는 선택 불가
    setSelectedReason(id);
    // 기타가 아닌 다른 옵션 선택 시 커스텀 입력 초기화
    if (id !== 4) {
      setCustomReason('');
    }
  };

  const handleWithdrawal = () => {
    if (!selectedReason) {
      toast.error('탈퇴 사유를 선택해주세요');
      return;
    }

    // 기타를 선택했는데 입력하지 않은 경우
    if (selectedReason === 4 && customReason.trim().length === 0) {
      toast.error('기타 사유를 입력해주세요');
      return;
    }

    // 커스텀 confirm 다이얼로그 표시
    setShowConfirmDialog(true);
  };

  const handleConfirmWithdrawal = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      let reason = '';
      if (selectedReason === 4) {
        // 기타 선택 시 사용자 입력 사용
        reason = customReason.trim();
      } else {
        // 기타가 아닐 경우 미리 정의된 텍스트 사용
        const selectedOption = cancellationOptions.find(
          (option) => option.id === selectedReason
        );
        reason = selectedOption?.text || '';
      }

      await withdrawal(reason);
      // withdrawal 함수가 성공 시 자동으로 리다이렉트하므로 여기서는 아무것도 안 함
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      // useWithdrawal에서 에러 처리를 하므로 여기서는 로딩만 해제
      setIsLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] h-full">

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6">
          <h1 className="text-xl font-semibold leading-7 text-neutral-800">
            회원탈퇴를 하는
            <br />
            이유를 알려주세요
          </h1>
        </div>

        <div className="flex flex-col px-5 mt-1.5 w-full text-base font-semibold">
          {cancellationOptions.map((option) => (
            <div key={option.id} className="mb-3">
              <div
                className={`flex gap-10 justify-between items-center py-4 px-5 w-full rounded-lg cursor-pointer transition-colors ${
                  selectedReason === option.id
                    ? 'bg-stone-200 border border-solid border-stone-700 text-stone-700'
                    : 'bg-neutral-50 hover:bg-stone-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleReasonSelect(option.id)}
              >
                <div>{option.text}</div>
                {selectedReason === option.id && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                )}
              </div>

              {/* 기타 선택 시 입력창 */}
              {option.id === 4 && selectedReason === 4 && (
                <div className="mt-3 px-2">
                  <textarea
                    value={customReason}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 60) {
                        setCustomReason(value);
                      }
                    }}
                    placeholder="탈퇴 사유를 입력해주세요"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={3}
                    maxLength={60}
                  />
                  <div className="mt-1 text-xs text-neutral-400 text-right">
                    {customReason.length}/60
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex flex-col w-full border-t border-gray-200">
        <div className="flex px-5 pt-2.5 pb-4 w-full gap-3">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1 py-4 text-base font-semibold rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:bg-stone-100 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleWithdrawal}
            disabled={!selectedReason || isLoading}
            className="flex-1 py-4 text-base font-semibold text-white rounded-lg bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리중...' : '탈퇴하기'}
          </button>
        </div>
      </div>

      {/* Confirm 다이얼로그 */}
      <WithdrawalConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmWithdrawal}
      />
    </div>
  );
}

