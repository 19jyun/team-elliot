'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { 
  approvePrincipalEnrollment, 
  rejectPrincipalEnrollment, 
  approvePrincipalRefund, 
  rejectPrincipalRefund 
} from '@/api/principal';
import { PrincipalRequestCard } from './PrincipalRequestCard';
import { PrincipalRejectionFormModal } from './PrincipalRejectionFormModal';
import { toast } from 'sonner';

export function PrincipalRequestDetail() {
  const { 
    personManagement, 
    setPersonManagementStep
  } = usePrincipalContext();
  const { selectedTab, selectedSessionId } = personManagement;
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Redux store에서 데이터 가져오기
  const { 
    getSessionEnrollments, 
    getSessionRefundRequests, 
    getStudentById,
    isLoading,
    error 
  } = usePrincipalData();

  // 선택된 세션의 요청 목록
  const requests = selectedSessionId 
    ? selectedTab === 'enrollment'
      ? getSessionEnrollments(selectedSessionId)
      : getSessionRefundRequests(selectedSessionId)
    : [];

  // 승인 처리 뮤테이션
  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      if (selectedTab === 'enrollment') {
        return approvePrincipalEnrollment(requestId);
      } else {
        return approvePrincipalRefund(requestId);
      }
    },
    onSuccess: () => {
      toast.success('승인 처리가 완료되었습니다.');
      // Redux store 업데이트를 위해 앱 데이터 재초기화
      queryClient.invalidateQueries({ queryKey: ['appData'] });
    },
    onError: (error) => {
      toast.error('승인 처리 중 오류가 발생했습니다.');
      console.error('Approval error:', error);
    },
  });

  // 거절 처리 뮤테이션
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason, detailedReason }: { requestId: number; reason: string; detailedReason?: string }) => {
      if (selectedTab === 'enrollment') {
        return rejectPrincipalEnrollment(requestId, { reason, detailedReason });
      } else {
        return rejectPrincipalRefund(requestId, { reason, detailedReason });
      }
    },
    onSuccess: () => {
      toast.success('거절 처리가 완료되었습니다.');
      // Redux store 업데이트를 위해 앱 데이터 재초기화
      queryClient.invalidateQueries({ queryKey: ['appData'] });
      setShowRejectionModal(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error('거절 처리 중 오류가 발생했습니다.');
      console.error('Rejection error:', error);
    },
  });

  const handleApprove = async (requestId: number) => {
    setIsProcessing(true);
    try {
      await approveMutation.mutateAsync(requestId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (requestId: number) => {
    setSelectedRequest({ id: requestId });
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = async (reason: string, detailedReason?: string) => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await rejectMutation.mutateAsync({ 
        requestId: selectedRequest.id, 
        reason, 
        detailedReason 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedRequest(null);
  };

  const handleGoBack = () => {
    setPersonManagementStep('enrollment-refund');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!selectedSessionId) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">세션을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-stone-600 hover:text-stone-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로 가기
        </button>
        <h2 className="text-lg font-semibold text-stone-900">
          {selectedTab === 'enrollment' ? '수강 신청' : '환불 요청'} 상세
        </h2>
      </div>

      {/* 요청 목록 */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500">
              {selectedTab === 'enrollment' ? '수강 신청' : '환불 요청'}이 없습니다.
            </p>
          </div>
        ) : (
          requests.map((request: any) => (
            <PrincipalRequestCard
              key={request.id}
              request={request}
              requestType={selectedTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={isProcessing}
            />
          ))
        )}
      </div>

      {/* 거절 모달 */}
      <PrincipalRejectionFormModal
        isOpen={showRejectionModal}
        onClose={handleCloseRejectionModal}
        onSubmit={handleRejectionSubmit}
        requestType={selectedTab}
        isLoading={isProcessing}
      />
    </div>
  );
} 