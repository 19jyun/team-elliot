'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface WithdrawalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawalConfirmModal({ isOpen, onClose, onConfirm }: WithdrawalConfirmModalProps) {
  const { pushFocus, popFocus } = useDashboardNavigation();

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

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">학원 탈퇴 확인</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          새 학원을 가입하려면 현재 소속된 학원을 탈퇴해야 합니다. 
          탈퇴하시겠습니까?
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            variant="outline"
          >
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  );
} 