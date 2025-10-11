'use client';

import React from 'react';
import { User, Calendar, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  requestType, 
  onApprove, 
  onReject, 
  isProcessing = false,
  isExpanded = false,
  onClick
}: PrincipalRequestCardProps) {
  // 처리 완료된 요청인지 확인
  const isCompleted = request.status === 'CONFIRMED' || request.status === 'REJECTED' || 
                     request.status === 'APPROVED' || request.status === 'REJECTED';

  // 상태 배지 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기';
      case 'CONFIRMED':
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  return (
    <div 
      className={`w-full bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-300 cursor-pointer ${
        isExpanded ? 'shadow-lg' : 'hover:shadow-md'
      }`}
      style={{
        width: '343px',
        minHeight: '153px',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '6px'
      }}
      onClick={onClick}
    >
      {/* 헤더: 요청 타입 + 상태 */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <span 
          className="font-bold text-black"
          style={{ fontSize: '18px', lineHeight: '140%', letterSpacing: '-0.01em' }}
        >
          {requestType === 'enrollment' ? '결제' : '환불'}
        </span>
        <Badge 
          className={`${request.statusColor} text-xs font-bold rounded-full`}
          style={{ 
            width: '70px', 
            height: '21px', 
            borderRadius: '10.5px',
            fontSize: '12px',
            lineHeight: '140%',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getStatusText(request.status)}
        </Badge>
      </div>
      
      {/* 기본 정보 (항상 표시) */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-black" />
          <span 
            className="text-black font-medium"
            style={{ fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.01em' }}
          >
            신청인: {request.studentName}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-black" />
          <span 
            className="text-black font-medium"
            style={{ fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.01em' }}
          >
            수업: {request.displaySessionDate} {request.displaySessionTime} {request.sessionInfo.className}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-black" />
          <span 
            className="text-black font-medium"
            style={{ fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.01em' }}
          >
            금액: {request.displayAmount}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-black" />
          <span 
            className="text-black font-medium"
            style={{ fontSize: '14px', lineHeight: '140%', letterSpacing: '-0.01em' }}
          >
            신청일시: {request.displayRequestedAt}
          </span>
        </div>
      </div>

      {/* 확장된 정보 (클릭 시 표시) */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4 space-y-4">
            {/* 환불 요청의 경우 추가 정보 */}
            {requestType === 'refund' && request.bankInfo && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">환불 계좌 정보</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">은행:</span>
                    <span>{request.bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">계좌번호:</span>
                    <span>{request.bankInfo.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">예금주:</span>
                    <span>{request.bankInfo.accountHolder}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 환불 요청의 경우 사유 */}
            {requestType === 'refund' && request.reason && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">환불 사유</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{request.reason}</p>
              </div>
            )}
            
            {/* 연락처 정보 */}
            {request.studentPhoneNumber && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">연락처</h4>
                <p className="text-sm text-gray-700">{request.studentPhoneNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 - 처리 완료되지 않은 경우에만 표시 */}
      {!isCompleted && (
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="flex gap-3 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(request.id);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: '#A48B88'
              }}
              >
                {isProcessing ? '처리중...' : '승인'}
              </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 