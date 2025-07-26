'use client';

import React, { useEffect, useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  onCloseButtonClick?: () => void;
  className?: string;
  contentClassName?: string;
}

export function SlideUpModal({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = true,
  onCloseButtonClick,
  className = '',
  contentClassName = ''
}: SlideUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { pushFocus, popFocus } = useDashboardNavigation();

  // 모달이 열릴 때 애니메이션 시작
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      pushFocus('modal'); // 모달이 열릴 때 포커스를 modal로 변경
    }
  }, [isOpen, pushFocus]);

  const handleClose = () => {
    setIsClosing(true);
    popFocus(); // 모달이 닫힐 때 이전 포커스로 복원
    // 애니메이션 완료 후에만 onClose 호출
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsVisible(false);
    }, 300); // 애니메이션 시간과 동일
  };

  const handleCloseButtonClick = () => {
    if (onCloseButtonClick) {
      // 애니메이션 시작
      setIsClosing(true);
      popFocus();
      
      // 애니메이션 완료 후 onCloseButtonClick 호출
      setTimeout(() => {
        onCloseButtonClick();
        setIsClosing(false);
        setIsVisible(false);
      }, 300);
    } else {
      handleClose();
    }
  };

  // 모달이 닫힐 때 애니메이션 처리
  useEffect(() => {
    if (!isOpen && isVisible) {
      setIsClosing(true);
      popFocus(); // 모달이 닫힐 때 이전 포커스로 복원
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
    }
  }, [isOpen, isVisible, popFocus]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-stone-900 bg-opacity-30" 
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div 
          className={`w-full max-w-md bg-white rounded-t-3xl transform transition-transform duration-300 ease-out overflow-hidden ${className}`}
          style={{
            maxHeight: '90vh',
            transform: isClosing ? 'translateY(100%)' : isVisible ? 'translateY(0)' : 'translateY(100%)'
          }}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-16 h-1 bg-gray-300 rounded-full" />
            </div>
          )}

          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="w-11" /> {/* 왼쪽 여백 고정 */}
            <div className="flex-1 flex justify-center px-4">
              <h1 className="text-base font-semibold tracking-normal leading-snug text-stone-900 text-center">
                {title}
              </h1>
            </div>
            <div className="w-11 flex justify-end">
              {showCloseButton && (
                <button
                  onClick={handleCloseButtonClick}
                  className="p-2 text-stone-500 hover:text-stone-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className={`px-5 flex flex-col flex-1 min-h-0 ${contentClassName}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 