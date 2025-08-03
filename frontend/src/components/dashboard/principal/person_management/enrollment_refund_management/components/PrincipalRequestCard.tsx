'use client';

import React from 'react';
import { parseFromUTCISO } from '@/lib/timeUtils';

interface PrincipalRequestCardProps {
  request: any;
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
    } catch (error) {
      return '날짜 없음';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Invalid Date') {
      return '시간 없음';
    }
    try {
      // UTC ISO 문자열을 한국 시간으로 변환
      const koreanTime = parseFromUTCISO(timeString);
      if (isNaN(koreanTime.getTime())) {
        return '시간 없음';
      }
      return koreanTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return '시간 없음';
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

  return (
    <div
      className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
      style={{ background: getLevelColor(request.session?.class?.level || 'BEGINNER') }}
    >
      {/* 학생 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-stone-600">
              {request.student?.name?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-stone-700">{request.student?.name || '알 수 없음'}</h3>
            <p className="text-sm text-stone-500">{request.student?.phoneNumber || '연락처 없음'}</p>
          </div>
        </div>
        <div className="text-right">
          {requestType === 'refund' && (
            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
              환불 요청
            </span>
          )}
        </div>
      </div>

      {/* 요청 정보 */}
      <div className="space-y-2">
        {requestType === 'enrollment' ? (
          // 수강 신청 정보
          <div className="text-sm text-stone-600">
            <p><strong>신청일:</strong> {formatDate(request.enrolledAt)}</p>
            <p><strong>상태:</strong> {request.status}</p>
            {request.session && (
              <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                <p className="font-medium text-stone-700 mb-1">세션 정보</p>
                <p><strong>날짜:</strong> {formatDate(request.session.date)}</p>
                <p><strong>시간:</strong> {formatTime(request.session.startTime)} - {formatTime(request.session.endTime)}</p>
              </div>
            )}
          </div>
        ) : (
          // 환불 요청 정보
          <div className="text-sm text-stone-600">
            <p><strong>환불 금액:</strong> {request.refundAmount?.toLocaleString()}원</p>
            <p><strong>요청 사유:</strong> {request.reason}</p>
            <p><strong>요청일:</strong> {formatDate(request.requestedAt)}</p>
            {request.sessionEnrollment?.session && (
              <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                <p className="font-medium text-stone-700 mb-1">세션 정보</p>
                <p><strong>날짜:</strong> {formatDate(request.sessionEnrollment.session.date)}</p>
                <p><strong>시간:</strong> {formatTime(request.sessionEnrollment.session.startTime)} - {formatTime(request.sessionEnrollment.session.endTime)}</p>
              </div>
            )}
            {request.bankName && (
              <div className="mt-2 p-2 bg-white/50 rounded border border-stone-200">
                <p className="font-medium text-stone-700 mb-1">환불 계좌</p>
                <p><strong>은행:</strong> {request.bankName}</p>
                <p><strong>계좌번호:</strong> {request.accountNumber}</p>
                <p><strong>예금주:</strong> {request.accountHolder}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(request.id);
          }}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isProcessing ? '처리중...' : '승인'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject(request.id);
          }}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 text-sm font-medium text-destructive border border-destructive bg-white hover:bg-destructive hover:text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isProcessing ? '처리중...' : '거절'}
        </button>
      </div>
    </div>
  );
}; 