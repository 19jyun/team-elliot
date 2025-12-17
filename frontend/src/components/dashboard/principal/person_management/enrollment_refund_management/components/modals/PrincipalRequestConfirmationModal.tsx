'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PrincipalRequestConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requestType: 'enrollment' | 'refund';
  isLoading?: boolean;
}

export function PrincipalRequestConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  requestType,
  isLoading = false,
}: PrincipalRequestConfirmationModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  // 모달이 닫힐 때 체크박스 초기화
  useEffect(() => {
    if (!isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    
    // 체크박스를 선택하면 자동으로 승인 처리
    if (checked && !isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setIsChecked(false);
    onClose();
  };

  if (!isOpen) return null;

  const title = requestType === 'enrollment' 
    ? '입금을 확인해주세요.' 
    : '송금을 확인해주세요.';
    
  const message = requestType === 'enrollment'
    ? '입금확인이 안되었지만 승인 처리를 하신 경우, 추후 불이익이 생길 수 있습니다.'
    : '송금을 하지 않고 승인 처리를 하신 경우, 추후 불이익이 생길 수 있습니다.';

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-6">
        {/* 확인 메시지 박스 */}
        <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          {/* 제목 */}
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-amber-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-amber-900">
              {title}
            </h2>
          </div>
          
          {/* 메시지 */}
          <p className="text-sm font-medium text-amber-900 leading-relaxed">
            {message}
          </p>
        </div>

        {/* 확인 체크박스 */}
        <label className="flex items-center gap-3 cursor-pointer p-3 -mx-3 rounded-lg hover:bg-stone-50 active:bg-stone-100 transition-colors">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            disabled={isLoading}
            className="w-5 h-5 rounded border-stone-300 text-[#AC9592] focus:ring-2 focus:ring-[#AC9592] focus:ring-offset-0 disabled:cursor-not-allowed cursor-pointer"
          />
          <span className="text-sm font-medium text-stone-700">
            확인하였습니다
          </span>
        </label>
      </div>
    </div>
  );
    
  return createPortal(modalContent, document.body);
}
