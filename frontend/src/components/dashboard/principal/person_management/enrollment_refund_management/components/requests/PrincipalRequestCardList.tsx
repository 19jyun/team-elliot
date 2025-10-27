'use client';

import React from 'react';
import { PrincipalRequestCard } from './PrincipalRequestCard';
import type { UnifiedRequest } from '@/types/view/principal';

interface PrincipalRequestCardListProps {
  requests: UnifiedRequest[];
  selectedTab: 'enrollment' | 'refund';
  expandedCardId: number | null;
  isProcessing: boolean;
  onCardClick: (id: number) => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => void;
}

export function PrincipalRequestCardList({
  requests,
  selectedTab,
  expandedCardId,
  isProcessing,
  onCardClick,
  onApprove,
  onReject,
}: PrincipalRequestCardListProps) {
  return (
    <>
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>요청이 없습니다.</p>
          <p className="text-sm">필터를 변경해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id}>
              <PrincipalRequestCard
                request={request}
                requestType={selectedTab}
                onApprove={onApprove}
                onReject={onReject}
                isExpanded={expandedCardId === request.id}
                isProcessing={isProcessing}
                onClick={() => onCardClick(request.id)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}