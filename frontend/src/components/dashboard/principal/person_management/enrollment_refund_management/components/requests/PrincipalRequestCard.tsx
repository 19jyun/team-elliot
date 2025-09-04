'use client';

import React from 'react';
import { toPrincipalRequestCardVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment, PrincipalRefundRequest } from '@/types/api/principal';
import type { PrincipalRequestCardVM } from '@/types/view/principal';

interface PrincipalRequestCardProps {
  request: PrincipalEnrollment | PrincipalRefundRequest;
  requestType: 'enrollment' | 'refund';
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing?: boolean;
}

export function PrincipalRequestCard({ 
  request, 
  requestType, 
  onApprove, 
  onReject, 
  isProcessing = false 
}: PrincipalRequestCardProps) {
  // ViewModel 생성
  const requestCardVM: PrincipalRequestCardVM = toPrincipalRequestCardVM({
    request,
    requestType,
    onApprove,
    onReject,
    isProcessing,
  });
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') {
      return '날짜 없음';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 없음';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '날짜 없음';
    }
  };


  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'BEGINNER': '#F4E7E7',
      'INTERMEDIATE': '#FBF4D8',
      'ADVANCED': '#CBDFE3',
    };
    return levelColors[level] || '#F4E7E7';
  };

  // 처리 완료된 요청인지 확인
  const isCompleted = request.status === 'CONFIRMED' || request.status === 'REJECTED' || 
                     request.status === 'APPROVED' || request.status === 'REJECTED';

  return (
    <div
      className={`border border-stone-200 rounded-lg transition-all duration-300 ${
        isCompleted 
          ? 'p-3 bg-stone-100' 
          : 'p-4 hover:bg-stone-50'
      }`}
      style={{ 
        background: isCompleted 
          ? '#f5f5f4' 
          : getLevelColor(
              'classLevel' in requestCardVM.request 
                ? requestCardVM.request.classLevel || 'BEGINNER'
                : 'BEGINNER'
            )
      }}
    >
      {/* 학생 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-stone-600">
              {requestCardVM.request.studentName?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-stone-700">
              {requestCardVM.request.studentName || '알 수 없음'}
            </h3>
            {!isCompleted && (
              <p className="text-sm text-stone-500">
                {requestCardVM.request.studentPhoneNumber || '연락처 없음'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {requestType === 'refund' && !isCompleted && (
            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
              환불 요청
            </span>
          )}
          {isCompleted && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              request.status === 'CONFIRMED' || request.status === 'APPROVED'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {request.status === 'CONFIRMED' || request.status === 'APPROVED' ? '승인 완료' : '거절 완료'}
            </span>
          )}
        </div>
      </div>

      {/* 요청 정보 - 처리 완료되지 않은 경우에만 표시 */}
      {!isCompleted && (
        <div className="space-y-2">
          {requestType === 'enrollment' ? (
            // 수강 신청 정보
            <div className="text-sm text-stone-600">
              <p><strong>신청일:</strong> {'displayEnrolledAt' in requestCardVM.request ? requestCardVM.request.displayEnrolledAt : formatDate((request as PrincipalEnrollment).enrolledAt)}</p>
              <p><strong>상태:</strong> {request.status}</p>
              {'displaySessionDate' in requestCardVM.request && requestCardVM.request.displaySessionDate && (
                <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                  <p className="font-medium text-stone-700 mb-1">세션 정보</p>
                  <p><strong>날짜:</strong> {requestCardVM.request.displaySessionDate}</p>
                  <p><strong>시간:</strong> {requestCardVM.request.displaySessionTime}</p>
                </div>
              )}
            </div>
          ) : (
            // 환불 요청 정보
            <div className="text-sm text-stone-600">
              <p><strong>환불 금액:</strong> {'displayRefundAmount' in requestCardVM.request ? requestCardVM.request.displayRefundAmount : `${(request as PrincipalRefundRequest).refundAmount?.toLocaleString()}원`}</p>
              <p><strong>요청 사유:</strong> {requestCardVM.request.reason}</p>
              <p><strong>요청일:</strong> {'displayRequestedAt' in requestCardVM.request ? requestCardVM.request.displayRequestedAt : formatDate((request as PrincipalRefundRequest).requestedAt)}</p>
              {'displaySessionDate' in requestCardVM.request && requestCardVM.request.displaySessionDate && (
                <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                  <p className="font-medium text-stone-700 mb-1">세션 정보</p>
                  <p><strong>날짜:</strong> {requestCardVM.request.displaySessionDate}</p>
                  <p><strong>시간:</strong> {requestCardVM.request.displaySessionTime}</p>
                </div>
              )}
              {requestType === 'refund' && 'bankName' in requestCardVM.request && requestCardVM.request.bankName && (
                <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                  <p className="font-medium text-stone-700 mb-1">환불 계좌</p>
                  <p><strong>은행:</strong> {requestCardVM.request.bankName}</p>
                  <p><strong>계좌번호:</strong> {requestCardVM.request.accountNumber}</p>
                  <p><strong>예금주:</strong> {requestCardVM.request.accountHolder}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼들 - 처리 완료되지 않은 경우에만 표시 */}
      {!isCompleted && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              requestCardVM.onApprove(requestCardVM.request.id);
            }}
            disabled={requestCardVM.isProcessing}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {requestCardVM.isProcessing ? '처리중...' : '승인'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              requestCardVM.onReject(requestCardVM.request.id);
            }}
            disabled={requestCardVM.isProcessing}
            className="flex-1 px-3 py-2 text-sm font-medium text-destructive border border-destructive bg-white hover:bg-destructive hover:text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {requestCardVM.isProcessing ? '처리중...' : '거절'}
          </button>
        </div>
      )}
    </div>
  );
}; 