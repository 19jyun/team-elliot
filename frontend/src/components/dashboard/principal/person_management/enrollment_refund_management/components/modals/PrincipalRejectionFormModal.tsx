'use client';

import React, { useState } from 'react';
import { SlideUpModal } from '@/components/common/SlideUpModal';

interface PrincipalRejectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detailedReason?: string) => void;
  requestType: 'enrollment' | 'refund';
  isLoading?: boolean;
}

export function PrincipalRejectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  requestType,
  isLoading = false,
}: PrincipalRejectionFormModalProps) {
  const [reason, setReason] = useState('');
  const [detailedReason, setDetailedReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    onSubmit(reason, detailedReason);
    // 폼 초기화
    setReason('');
    setDetailedReason('');
  };

  const handleClose = () => {
    // 폼 초기화
    setReason('');
    setDetailedReason('');
    onClose();
  };

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${requestType === 'enrollment' ? '수강 신청' : '환불 요청'} 거절 사유 입력`}
      contentClassName="pb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 거절 사유 선택 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            거절 사유 *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">사유를 선택해주세요</option>
            <option value="정원 초과">정원 초과</option>
            <option value="수업 레벨 부적합">수업 레벨 부적합</option>
            <option value="일정 불일치">일정 불일치</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 상세 사유 입력 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            상세 사유 (선택사항)
          </label>
          <textarea
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            rows={4}
            placeholder="추가적인 거절 사유를 입력해주세요..."
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isLoading ? '처리중...' : '거절하기'}
          </button>
        </div>
      </form>
    </SlideUpModal>
  );
} 