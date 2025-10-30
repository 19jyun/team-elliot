'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface WithdrawalConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawalConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: WithdrawalConfirmDialogProps) {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;

  useEffect(() => {
    if (isOpen) {
      pushFocus('modal');
    } else {
      popFocus();
    }
  }, [isOpen, pushFocus, popFocus]);

  const handleClose = () => {
    popFocus();
    onClose();
  };

  const handleConfirm = () => {
    popFocus();
    onConfirm();
  };

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">회원 탈퇴 확인</h3>
        </div>

        <p className="text-gray-600 mb-6">
          정말로 탈퇴하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
                  <br />탈퇴 후 회원님의 수업 내역, 환불 내역, 출석 등 모든 정보가 삭제됩니다.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 text-base font-semibold rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 text-base font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

