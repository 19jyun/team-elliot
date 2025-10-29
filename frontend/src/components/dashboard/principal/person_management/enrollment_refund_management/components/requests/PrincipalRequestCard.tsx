'use client';

import React from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import type { UnifiedRequest } from '@/types/view/principal';

interface PrincipalRequestCardProps {
  request: UnifiedRequest;
  requestType: 'enrollment' | 'refund';
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

export function PrincipalRequestCard({ 
  request, 
  requestType: _requestType,
  onApprove, 
  onReject, 
  isProcessing = false,
  isExpanded = false,
  onClick
}: PrincipalRequestCardProps) {
  const { copy } = useClipboard({
    successMessage: "계좌번호가 복사되었습니다",
  });

  // 처리 완료된 요청인지 확인
  const isCompleted = request.status === 'CONFIRMED' || request.status === 'REJECTED' || 
                     request.status === 'APPROVED';
  const isApproved = request.status === 'CONFIRMED' || request.status === 'APPROVED';
  const isRejected = request.status === 'REJECTED';

  // 계좌번호 복사 함수
  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (request.bankInfo) {
      const accountText = `${request.bankInfo.bankName} ${request.bankInfo.accountNumber}`;
      copy(accountText);
    }
  };

  // 금액을 숫자로 변환 (displayAmount에서 "원"과 쉼표 제거)
  const amount = request.displayAmount.replace(/[^0-9]/g, '');

  return (
    <div className="flex flex-col w-full transition-all duration-300 ease-in-out">
      <div 
        className="flex flex-row items-center px-5 py-6 gap-4 w-[375px] bg-white border-b border-[#D9D9D9] cursor-pointer box-border"
        onClick={onClick}
      >
        {/* 메인 콘텐츠 */}
        <div className="flex flex-col items-start gap-4 w-full">
          {/* 체크박스 / X 표시 */}
          <div
            className={`flex flex-row justify-center items-center w-6 h-6 rounded-full transition-all duration-200 ${
              isApproved ? 'bg-[#AC9592]' : isRejected ? 'bg-[#FF5656]' : 'bg-[#AC9592] opacity-20'
            }`}
          >
            {isRejected ? (
              // X 아이콘
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2L12 12M12 2L2 12"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // 체크 아이콘
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5L5 9L13 1"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* 금액 */}
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-base leading-[19px] text-black">
              {amount}
            </span>
            <span className="font-semibold text-base leading-[19px] text-black">
              원
            </span>
          </div>

          {/* 신청인 정보 그룹 */}
          <div className="flex flex-col items-start gap-2 w-full">
            {/* 신청인 이름 */}
            <span className="font-semibold text-base leading-[19px] text-black">
              {request.studentName}
            </span>

            {/* 수업 정보 */}
            <span className="font-medium text-sm leading-[120%] tracking-[-0.01em] text-black">
              {request.displaySessionDate}
            </span>

            <span className="font-medium text-sm leading-[120%] tracking-[-0.01em] text-black">
              {request.displaySessionTime} {request.sessionInfo.className}
            </span>

            {/* 신청일시 */}
            <span className="font-medium text-[10px] leading-[140%] tracking-[-0.01em] text-[#B3B3B3] whitespace-nowrap">
              {request.displayRequestedAt}
            </span>
          </div>

          {/* 계좌번호 복사 버튼 */}
          {request.bankInfo && (
            <button
              onClick={handleCopyAccount}
              className="flex flex-row justify-center items-center px-2 py-1 gap-2 w-full h-7 rounded-full border border-[#AC9592] bg-transparent hover:bg-[#AC9592] active:bg-[#AC9592] transition-colors duration-200 group"
            >
              <span className="font-medium text-sm leading-[140%] tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis text-[#AC9592] group-hover:text-white group-active:text-white">
                {request.bankInfo.bankName} {request.bankInfo.accountNumber} 복사
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 확장된 정보 및 액션 버튼 */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded && !isCompleted ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="w-[375px] bg-white border-b border-[#D9D9D9] px-5 py-4">
          <div className="flex flex-col gap-4">
            {/* 전화번호 정보 */}
            {request.studentPhoneNumber && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">연락처</span>
                <span className="text-sm font-medium text-black">
                  {request.studentPhoneNumber}
                </span>
              </div>
            )}
            
            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(request.id);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 bg-white hover:bg-red-600 hover:text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isProcessing ? '처리중...' : '거절'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(request.id);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#AC9592] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors hover:opacity-90"
              >
                {isProcessing ? '처리중...' : '승인'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 