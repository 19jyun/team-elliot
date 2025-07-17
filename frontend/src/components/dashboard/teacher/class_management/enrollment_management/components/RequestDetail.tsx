'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { getSessionRequests, approveEnrollment, rejectEnrollment, approveRefund, rejectRefund } from '@/api/teacher';
import { RequestCard } from './RequestCard';
import { RejectionFormModal } from './RejectionFormModal';
import { toast } from 'sonner';

export function RequestDetail() {
  const { 
    enrollmentManagement, 
    setEnrollmentManagementStep,
    goBack
  } = useDashboardNavigation();
  const { selectedTab, selectedSessionId } = enrollmentManagement;
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // 선택된 세션의 요청 목록 조회
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['session-requests', selectedSessionId, selectedTab],
    queryFn: () => getSessionRequests(selectedSessionId!, selectedTab),
    enabled: !!selectedSessionId,
  });

  // 승인 처리 뮤테이션
  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      if (selectedTab === 'enrollment') {
        return approveEnrollment(requestId);
      } else {
        return approveRefund(requestId);
      }
    },
    onSuccess: () => {
      toast.success('승인 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['session-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions-requests'] });
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
        return rejectEnrollment(requestId, { reason, detailedReason });
      } else {
        return rejectRefund(requestId, { reason, detailedReason });
      }
    },
    onSuccess: () => {
      toast.success('거절 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['session-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions-requests'] });
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
    setEnrollmentManagementStep('session-list');
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

  return (
    <div className="flex flex-col h-full">
      {/* 요청 리스트 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <RequestCard
                key={request.id}
                request={request}
                requestType={selectedTab}
                onClick={() => {}} // 클릭 시 아무것도 하지 않음
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-stone-500 mb-4">
                {selectedTab === 'enrollment' 
                  ? '수강 신청 요청이 없습니다.'
                  : '환불 요청이 없습니다.'
                }
              </p>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                세션 목록으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 거절 폼 모달 */}
      <RejectionFormModal
        isOpen={showRejectionModal}
        onClose={handleCloseRejectionModal}
        onSubmit={handleRejectionSubmit}
        requestType={selectedTab}
        isLoading={isProcessing}
      />
    </div>
  );
} 