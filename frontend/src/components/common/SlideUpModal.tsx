'use client';

import React, { useEffect, useState } from 'react';

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

  // 모달이 열릴 때 애니메이션 시작
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // 애니메이션 완료 후에만 onClose 호출
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsVisible(false);
    }, 300); // 애니메이션 시간과 동일
  };

  const handleCloseButtonClick = () => {
    if (onCloseButtonClick) {
      onCloseButtonClick();
    } else {
      handleClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`w-full h-full transition-opacity duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="flex flex-col w-full bg-white h-full">
        <div className="flex flex-col w-full bg-stone-900 bg-opacity-30 h-full">
          <div 
            className={`flex flex-col w-full bg-white rounded-3xl h-full transform transition-transform duration-300 ease-out ${className} ${
              isClosing ? 'translate-y-full' : isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-16 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 pb-4 relative">
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
            <main className={`flex-1 min-h-0 bg-white px-5 ${contentClassName}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 